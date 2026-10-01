package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"syscall"
	"time"
	"unicode"
)

// ---------- 安全抓取：只访问公网地址，防止 SSRF ----------

var errPrivateAddr = errors.New("目标地址不是公网地址")

// cgnat 是运营商级 NAT 地址段（100.64.0.0/10），net.IP 没有现成的判断。
var cgnat = &net.IPNet{IP: net.IPv4(100, 64, 0, 0), Mask: net.CIDRMask(10, 32)}

func isPublicIP(ip net.IP) bool {
	return !(ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() ||
		ip.IsInterfaceLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() || cgnat.Contains(ip))
}

// newSafeClient 在建立连接时校验解析后的 IP（Control 拿到的是实际连接地址，DNS 重绑定也绕不过），
// 并且只允许 80 / 443 端口。
func newSafeClient(timeout time.Duration) *http.Client {
	dialer := &net.Dialer{
		Timeout: 5 * time.Second,
		Control: func(network, address string, _ syscall.RawConn) error {
			host, port, err := net.SplitHostPort(address)
			if err != nil {
				return err
			}
			if port != "80" && port != "443" {
				return errPrivateAddr
			}
			ip := net.ParseIP(host)
			if ip == nil || !isPublicIP(ip) {
				return errPrivateAddr
			}
			return nil
		},
	}
	transport := &http.Transport{
		Proxy:                 nil, // 直连，避免经代理访问时绕过地址校验
		DialContext:           dialer.DialContext,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 8 * time.Second,
		MaxIdleConns:          10,
		IdleConnTimeout:       30 * time.Second,
	}
	return &http.Client{
		Timeout:   timeout,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return errors.New("重定向次数过多")
			}
			if req.URL.Scheme != "http" && req.URL.Scheme != "https" {
				return errors.New("不支持的协议")
			}
			return nil
		},
	}
}

// 部分站点会拒绝空 UA，这里如实标明是测评程序。
const auditUA = "Mozilla/5.0 (compatible; CloudWiseAudit/1.0)"

type fetched struct {
	status   int
	finalURL *url.URL
	body     string
	ttfb     time.Duration
}

func fetchPage(ctx context.Context, c *http.Client, rawURL string, limit int64) (*fetched, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", auditUA)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	start := time.Now()
	resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	ttfb := time.Since(start)
	b, _ := io.ReadAll(io.LimitReader(resp.Body, limit))
	return &fetched{status: resp.StatusCode, finalURL: resp.Request.URL, body: string(b), ttfb: ttfb}, nil
}

// ---------- 输入解析 ----------

var hostnameRe = regexp.MustCompile(`^(?i)[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$`)

// parseAuditTarget 判断输入是官网域名还是品牌名。是域名时返回小写主机名（不含端口与路径）。
func parseAuditTarget(input string) (domain string, ok bool) {
	s := strings.TrimSpace(input)
	if s == "" || strings.ContainsAny(s, " \t") {
		return "", false
	}
	if !strings.Contains(s, "://") {
		s = "https://" + s
	}
	u, err := url.Parse(s)
	if err != nil || u.Hostname() == "" {
		return "", false
	}
	h := strings.ToLower(strings.TrimSuffix(u.Hostname(), "."))
	if net.ParseIP(h) != nil || !hostnameRe.MatchString(h) {
		return "", false
	}
	return h, true
}

// parseAuditInput 解析测评输入：像域名的按域名处理，否则当作品牌名（2～60 个字符）。
func parseAuditInput(input string) (domain, brand string, ok bool) {
	if d, isDomain := parseAuditTarget(input); isDomain {
		return d, "", true
	}
	brand = strings.Join(strings.Fields(input), " ")
	n := len([]rune(brand))
	if n < 2 || n > 60 || strings.ContainsAny(brand, "<>{}\\/@") {
		return "", "", false
	}
	for _, r := range brand {
		if unicode.IsControl(r) {
			return "", "", false
		}
	}
	return "", brand, true
}

// 这些是平台、目录与社交网站，不会是企业官网。
var notOfficialSites = []string{"alibaba.com", "aliexpress.com", "made-in-china.com", "globalsources.com", "amazon.", "linkedin.com",
	"facebook.com", "instagram.com", "youtube.com", "wikipedia.org", "baidu.com", "1688.com", "zhihu.com", "qcc.com", "tianyancha.com",
	"crunchbase.com", "example.com", "bloomberg.com", "thomasnet.com", "x.com", "twitter.com", "tiktok.com"}

var domainInTextRe = regexp.MustCompile(`(?i)\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24})\b`)

// resolveDomain 让 AI 联网查找品牌官网，找不到或不确定时返回空。
func (a *App) resolveDomain(ctx context.Context, brand string) string {
	if a.gemini == nil {
		return ""
	}
	cctx, cancel := context.WithTimeout(ctx, 45*time.Second)
	defer cancel()
	prompt := fmt.Sprintf(`What is the official company website of the brand or company "%s"? It is most likely a Chinese manufacturer or exporter.
Answer with the bare domain only (for example example.com). If you cannot identify the official website with confidence, answer NONE.
Do not answer with marketplaces, directories, social media or news sites.`, brand)
	text, _, err := a.gemini.AskWithSearch(cctx, prompt)
	if err != nil {
		log.Printf("测评查找官网失败: %v", err)
		return ""
	}
	if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(text)), "NONE") {
		return ""
	}
	for _, m := range domainInTextRe.FindAllString(text, 5) {
		d, ok := parseAuditTarget(m)
		if !ok {
			continue
		}
		bad := false
		for _, s := range notOfficialSites {
			bad = bad || strings.Contains(d, s)
		}
		if !bad {
			return d
		}
	}
	return ""
}

// ---------- 官网检查 ----------

// aiCrawlers 是主流 AI 搜索与训练所用的爬虫。robots.txt 屏蔽它们，AI 就读不到官网内容。
var aiCrawlers = []struct{ Agent, Product string }{
	{"OAI-SearchBot", "ChatGPT 搜索"},
	{"GPTBot", "OpenAI 训练"},
	{"PerplexityBot", "Perplexity"},
	{"ClaudeBot", "Claude"},
	{"Google-Extended", "Gemini"},
}

type crawlerAccess struct {
	Agent   string `json:"agent"`
	Product string `json:"product"`
	Allowed bool   `json:"allowed"`
}

// SiteCheck 是对官网的确定性检查结果，不经过模型，可以复现。
type SiteCheck struct {
	Reachable   bool            `json:"reachable"`
	Error       string          `json:"error,omitempty"`
	FinalURL    string          `json:"finalUrl"`
	HTTPS       bool            `json:"https"`
	TTFBMs      int             `json:"ttfbMs"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Lang        string          `json:"lang"`
	English     bool            `json:"english"`
	Hreflangs   int             `json:"hreflangs"`
	TextChars   int             `json:"textChars"`
	SchemaTypes []string        `json:"schemaTypes"`
	HasRobots   bool            `json:"hasRobots"`
	Crawlers    []crawlerAccess `json:"crawlers"`
	HasSitemap  bool            `json:"hasSitemap"`
	HasLlmsTxt  bool            `json:"hasLlmsTxt"`
	Score       int             `json:"score"`

	text string // 正文前若干字，交给模型识别品牌与行业，不返回给前端
}

var (
	reScriptStyle = regexp.MustCompile(`(?is)<(script|style|noscript|svg|template)\b.*?</(script|style|noscript|svg|template)>`)
	reTag         = regexp.MustCompile(`(?s)<[^>]+>`)
	reSpaces      = regexp.MustCompile(`\s+`)
	reTitle       = regexp.MustCompile(`(?is)<title[^>]*>(.*?)</title>`)
	reHTMLLang    = regexp.MustCompile(`(?is)<html[^>]*\blang\s*=\s*["']?([a-zA-Z-]+)`)
	reMeta        = regexp.MustCompile(`(?is)<meta\b[^>]*>`)
	reAttr        = regexp.MustCompile(`(?is)([a-z-]+)\s*=\s*("([^"]*)"|'([^']*)')`)
	reHreflang    = regexp.MustCompile(`(?is)<link\b[^>]*\bhreflang\s*=`)
	reJSONLD      = regexp.MustCompile(`(?is)<script[^>]*type\s*=\s*["']application/ld\+json["'][^>]*>(.*?)</script>`)
	reSitemapLine = regexp.MustCompile(`(?im)^\s*sitemap\s*:`)
)

func attrs(tag string) map[string]string {
	m := map[string]string{}
	for _, a := range reAttr.FindAllStringSubmatch(tag, -1) {
		v := a[3]
		if v == "" {
			v = a[4]
		}
		m[strings.ToLower(a[1])] = html.UnescapeString(v)
	}
	return m
}

func visibleText(page string) string {
	s := reScriptStyle.ReplaceAllString(page, " ")
	s = reTag.ReplaceAllString(s, " ")
	return strings.TrimSpace(reSpaces.ReplaceAllString(html.UnescapeString(s), " "))
}

// collectSchemaTypes 递归收集 JSON-LD 中的 @type（含 @graph）。
func collectSchemaTypes(v any, seen map[string]bool) {
	switch t := v.(type) {
	case map[string]any:
		switch ty := t["@type"].(type) {
		case string:
			seen[ty] = true
		case []any:
			for _, x := range ty {
				if s, ok := x.(string); ok {
					seen[s] = true
				}
			}
		}
		for k, x := range t {
			if k != "@type" && k != "@context" {
				collectSchemaTypes(x, seen)
			}
		}
	case []any:
		for _, x := range t {
			collectSchemaTypes(x, seen)
		}
	}
}

// robotsBlocks 判断 robots.txt 是否整站屏蔽了某个爬虫。只看 Disallow: / 这种整站屏蔽，
// 规则匹配按「专属分组优先，否则用 *」处理，足够判断 AI 能不能读官网。
func robotsBlocks(robots, agent string) bool {
	type group struct {
		agents   []string
		disallow bool
		allowAll bool
	}
	var groups []*group
	var cur *group
	lastWasAgent := false
	for _, line := range strings.Split(robots, "\n") {
		if i := strings.Index(line, "#"); i >= 0 {
			line = line[:i]
		}
		k, v, ok := strings.Cut(line, ":")
		if !ok {
			continue
		}
		k = strings.ToLower(strings.TrimSpace(k))
		v = strings.TrimSpace(v)
		switch k {
		case "user-agent":
			if cur == nil || !lastWasAgent {
				cur = &group{}
				groups = append(groups, cur)
			}
			cur.agents = append(cur.agents, strings.ToLower(v))
			lastWasAgent = true
		case "disallow", "allow":
			lastWasAgent = false
			if cur == nil {
				continue
			}
			if v == "/" || v == "/*" {
				if k == "disallow" {
					cur.disallow = true
				} else {
					cur.allowAll = true
				}
			}
		default:
			lastWasAgent = false
		}
	}
	find := func(name string) *group {
		for _, g := range groups {
			for _, a := range g.agents {
				if a == name {
					return g
				}
			}
		}
		return nil
	}
	g := find(strings.ToLower(agent))
	if g == nil {
		g = find("*")
	}
	return g != nil && g.disallow && !g.allowAll
}

// asciiRatio 粗略判断正文是否以英文为主。
func asciiRatio(s string) float64 {
	if s == "" {
		return 0
	}
	var ascii, total int
	for _, r := range s {
		if r == ' ' {
			continue
		}
		total++
		if r < 128 {
			ascii++
		}
	}
	if total == 0 {
		return 0
	}
	return float64(ascii) / float64(total)
}

// checkSite 抓取官网首页、robots.txt、sitemap.xml、llms.txt，并按固定规则打分（满分 100）。
func checkSite(ctx context.Context, domain string) *SiteCheck {
	c := newSafeClient(12 * time.Second)
	sc := &SiteCheck{Crawlers: []crawlerAccess{}, SchemaTypes: []string{}}

	var page *fetched
	var lastErr error
	for _, scheme := range []string{"https://", "http://"} {
		page, lastErr = fetchPage(ctx, c, scheme+domain+"/", 2<<20)
		if lastErr == nil && page.status < 400 {
			break
		}
		if lastErr == nil {
			lastErr = fmt.Errorf("HTTP %d", page.status)
		}
		page = nil
	}
	if page == nil {
		sc.Error = siteErrText(lastErr)
		return sc
	}
	sc.Reachable = true
	sc.FinalURL = page.finalURL.String()
	sc.HTTPS = page.finalURL.Scheme == "https"
	sc.TTFBMs = int(page.ttfb.Milliseconds())
	base := page.finalURL.Scheme + "://" + page.finalURL.Host

	body := page.body
	if m := reTitle.FindStringSubmatch(body); m != nil {
		sc.Title = clip(visibleText(m[1]), 200)
	}
	if m := reHTMLLang.FindStringSubmatch(body); m != nil {
		sc.Lang = strings.ToLower(m[1])
	}
	for _, tag := range reMeta.FindAllString(body, -1) {
		a := attrs(tag)
		if strings.EqualFold(a["name"], "description") || strings.EqualFold(a["property"], "og:description") {
			if sc.Description == "" {
				sc.Description = clip(a["content"], 300)
			}
		}
	}
	sc.Hreflangs = len(reHreflang.FindAllString(body, -1))
	seen := map[string]bool{}
	for _, m := range reJSONLD.FindAllStringSubmatch(body, -1) {
		var v any
		if json.Unmarshal([]byte(strings.TrimSpace(m[1])), &v) == nil {
			collectSchemaTypes(v, seen)
		}
	}
	for t := range seen {
		sc.SchemaTypes = append(sc.SchemaTypes, t)
	}
	sort.Strings(sc.SchemaTypes)

	text := visibleText(body)
	sc.TextChars = len([]rune(text))
	sc.English = strings.HasPrefix(sc.Lang, "en") || (sc.Lang == "" && asciiRatio(text) > 0.9)
	sc.text = clip(text, 4000)

	// robots.txt
	robots := ""
	if r, err := fetchPage(ctx, c, base+"/robots.txt", 256<<10); err == nil && r.status == 200 && !looksLikeHTML(r.body) {
		sc.HasRobots = true
		robots = r.body
	}
	for _, bot := range aiCrawlers {
		sc.Crawlers = append(sc.Crawlers, crawlerAccess{Agent: bot.Agent, Product: bot.Product, Allowed: !robotsBlocks(robots, bot.Agent)})
	}
	sc.HasSitemap = reSitemapLine.MatchString(robots)
	if !sc.HasSitemap {
		if r, err := fetchPage(ctx, c, base+"/sitemap.xml", 64<<10); err == nil && r.status == 200 &&
			(strings.Contains(r.body, "<urlset") || strings.Contains(r.body, "<sitemapindex")) {
			sc.HasSitemap = true
		}
	}
	if r, err := fetchPage(ctx, c, base+"/llms.txt", 64<<10); err == nil && r.status == 200 && !looksLikeHTML(r.body) && strings.TrimSpace(r.body) != "" {
		sc.HasLlmsTxt = true
	}

	sc.Score = scoreSite(sc)
	return sc
}

func looksLikeHTML(s string) bool {
	head := strings.ToLower(strings.TrimSpace(clip(s, 200)))
	return strings.HasPrefix(head, "<!doctype") || strings.HasPrefix(head, "<html")
}

func siteErrText(err error) string {
	switch {
	case err == nil:
		return "无法访问"
	case errors.Is(err, errPrivateAddr):
		return "域名解析到了非公网地址"
	case errors.Is(err, context.DeadlineExceeded) || strings.Contains(err.Error(), "timeout"):
		return "访问超时"
	case strings.Contains(err.Error(), "no such host"):
		return "域名无法解析"
	case strings.HasPrefix(err.Error(), "HTTP "):
		return "官网返回 " + err.Error()
	}
	return "无法访问"
}

// scoreSite：AI 可读取性评分。权重按对 AI 检索影响的大小分配，合计 100。
func scoreSite(sc *SiteCheck) int {
	if !sc.Reachable {
		return 0
	}
	score := 0
	if sc.HTTPS {
		score += 10
	} else {
		score += 5
	}
	allowed := 0
	for _, c := range sc.Crawlers {
		if c.Allowed {
			allowed++
		}
	}
	score += 25 * allowed / len(aiCrawlers)
	switch {
	case sc.TextChars >= 1500:
		score += 20
	case sc.TextChars >= 500:
		score += 10
	case sc.TextChars >= 150:
		score += 4
	}
	if sc.English {
		score += 10
	}
	has := func(names ...string) bool {
		for _, t := range sc.SchemaTypes {
			for _, n := range names {
				if t == n {
					return true
				}
			}
		}
		return false
	}
	if has("Organization", "Corporation", "LocalBusiness", "MedicalOrganization") {
		score += 8
	}
	if has("Product", "FAQPage", "ProductGroup", "Service", "Offer") {
		score += 5
	}
	if sc.HasSitemap {
		score += 5
	}
	if sc.HasLlmsTxt {
		score += 4
	}
	if sc.Title != "" && sc.Description != "" {
		score += 5
	}
	if sc.Hreflangs > 0 {
		score += 3
	}
	switch {
	case sc.TTFBMs > 0 && sc.TTFBMs < 800:
		score += 5
	case sc.TTFBMs < 2000:
		score += 2
	}
	if score > 100 {
		score = 100
	}
	return score
}
