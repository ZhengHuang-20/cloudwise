package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"regexp"
	"runtime/debug"
	"sort"
	"strings"
	"sync"
	"time"
)

// AI 可见性测评：抓取官网做确定性检查 → 模型识别品牌与行业 → 生成海外买家问题 →
// 向各探测平台（ChatGPT、Perplexity、Gemini，均开启联网搜索）真实提问 → 统计提及、排位与引用，
// 分数由代码按公式计算。品牌识别、问题生成与结果分析统一用 Gemini，所以未配置 Gemini 时只有示例。
// 一次测评要调用几十次模型，所以做成异步任务：POST 创建，GET 轮询进度与结果。

const (
	auditUnbranded   = 6                  // 不带品牌名的买家问题数
	auditSamples     = 2                  // 每个问题问几次（AI 回答有随机性，按比例统计）
	auditConcurrency = 4                  // 单个任务内每个平台同时提问数
	auditMaxRunning  = 3                  // 同时运行的任务数，其余排队
	auditCacheTTL    = 7 * 24 * time.Hour // 同一域名 7 天内复用结果
	auditMemTTL      = 24 * time.Hour     // 内存里保留已完成任务的时长
)

// ---------- 报告结构（前端 src/lib/audit.ts 的 AuditReport 与之对应） ----------

type auditEntity struct {
	Brand      string   `json:"brand"`
	Aliases    []string `json:"aliases"`
	Industry   string   `json:"industry"`
	CategoryEn string   `json:"categoryEn"`
	Products   []string `json:"products"`
	Market     string   `json:"market"`
	MarketEn   string   `json:"marketEn"`
}

type auditEvidence struct {
	Engine    string      `json:"engine"`
	Question  string      `json:"question"`
	Branded   bool        `json:"branded"`
	Answer    string      `json:"answer"`
	Mentioned bool        `json:"mentioned"`
	Position  int         `json:"position"`
	Sentiment string      `json:"sentiment"`
	OwnCited  bool        `json:"ownCited"`
	Sources   []WebSource `json:"sources"`
}

// auditEngineResult 是单个平台的统计，口径与 auditMetrics 相同。
type auditEngineResult struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Answers        int     `json:"answers"` // 有效回答数
	Failed         int     `json:"failed"`  // 提问失败数
	MentionRate    int     `json:"mentionRate"`
	CitationRate   int     `json:"citationRate"`
	BrandKnowledge int     `json:"brandKnowledge"`
	AvgPosition    float64 `json:"avgPosition"`
}

type auditVoice struct {
	Name     string `json:"name"`
	Mentions int    `json:"mentions"`
	IsSelf   bool   `json:"isSelf"`
}

type auditMetrics struct {
	MentionRate    int     `json:"mentionRate"`    // 不带品牌名的问题中被提及的比例
	CitationRate   int     `json:"citationRate"`   // 官网被列为引用来源的比例
	BrandKnowledge int     `json:"brandKnowledge"` // 直接问品牌时 AI 能给出具体介绍的比例
	Readability    int     `json:"readability"`    // 官网 AI 可读取性（SiteCheck.Score）
	AvgPosition    float64 `json:"avgPosition"`    // 被提及时在推荐列表中的平均位置，0 表示无
}

type AuditReport struct {
	ID        string `json:"id"`
	Domain    string `json:"domain"`
	Mode      string `json:"mode"` // live：真实探测；sample：未配置模型，AI 部分为示例；site_only：AI 探测失败，只有官网检查
	CreatedAt string `json:"createdAt"`

	Entity       auditEntity         `json:"entity"`
	TotalScore   int                 `json:"totalScore"`
	Level        string              `json:"level"`
	Metrics      auditMetrics        `json:"metrics"`
	Engine       string              `json:"engine"`    // 平台名，顿号分隔
	EngineSet    string              `json:"engineSet"` // 平台签名，平台变化后不复用旧缓存
	Engines      []auditEngineResult `json:"engines"`
	Questions    int                 `json:"questions"`
	Samples      int                 `json:"samples"`
	Answers      int                 `json:"answers"`
	ShareOfVoice []auditVoice        `json:"shareOfVoice"`
	Evidence     []auditEvidence     `json:"evidence"`
	Site         *SiteCheck          `json:"site"`
	Findings     []string            `json:"findings"`
	Advice       string              `json:"recommendation"`

	unbrandedAnswers int // 不带品牌名问题的有效回答数，只用于生成文案
}

// ---------- 任务存储 ----------

type auditJob struct {
	ID      string
	Key     string
	Status  string // queued | running | done | failed
	Step    int    // 1~5，对应前端进度
	Done    int
	Total   int
	Engines []string // 本次提问的平台名，用于进度文案
	Err     string
	Report  *AuditReport
	created time.Time
}

type auditStore struct {
	mu       sync.Mutex
	jobs     map[string]*auditJob
	byKey    map[string]string // 域名 → 最近一次成功任务
	day      string
	dayCount int
	sem      chan struct{}
}

func newAuditStore() *auditStore {
	return &auditStore{jobs: map[string]*auditJob{}, byKey: map[string]string{}, sem: make(chan struct{}, auditMaxRunning)}
}

// snapshot 在锁内复制任务状态，避免与后台 goroutine 竞争。
func (s *auditStore) snapshot(id string) (auditJob, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	j, ok := s.jobs[id]
	if !ok {
		return auditJob{}, false
	}
	return *j, true
}

func (s *auditStore) update(j *auditJob, f func(*auditJob)) {
	s.mu.Lock()
	f(j)
	s.mu.Unlock()
}

func (s *auditStore) prune(now time.Time) {
	for id, j := range s.jobs {
		if (j.Status == "done" || j.Status == "failed") && now.Sub(j.created) > auditMemTTL {
			delete(s.jobs, id)
			if s.byKey[j.Key] == id {
				delete(s.byKey, j.Key)
			}
		}
	}
}

// takeBudget 占用当日（UTC）一次真实探测额度，超出返回 false。
func (s *auditStore) takeBudget(now time.Time, limit int) bool {
	day := now.Format("2006-01-02")
	if s.day != day {
		s.day, s.dayCount = day, 0
	}
	if s.dayCount >= limit {
		return false
	}
	s.dayCount++
	return true
}

func newAuditID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

var auditIDRe = regexp.MustCompile(`^[0-9a-f]{32}$`)

// ---------- 接口 ----------

func (a *App) handleCreateAudit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Target  string `json:"target"`
		Website string `json:"website"` // 蜜罐字段，真人看不到
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	if req.Website != "" {
		writeError(w, http.StatusBadRequest, "bad_request", "请求无效")
		return
	}
	domain, ok := parseAuditTarget(req.Target)
	if !ok {
		writeError(w, http.StatusBadRequest, "bad_target", "请输入官网域名，例如 www.example.com")
		return
	}
	if !a.auditLimiter.allow(a.clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "rate_limited", "测评次数过多，请一小时后再试")
		return
	}
	key := strings.TrimPrefix(domain, "www.")
	now := time.Now().UTC()
	sig := engineSignature(a.activeEngines())
	s := a.audits

	// 7 天内测过的域名直接复用：先查内存，再查数据库。
	s.mu.Lock()
	s.prune(now)
	if id, ok := s.byKey[key]; ok {
		if j := s.jobs[id]; j != nil && j.Status == "done" && now.Sub(j.created) < auditCacheTTL && j.Report.EngineSet == sig {
			s.mu.Unlock()
			writeJSON(w, http.StatusOK, map[string]any{"id": id, "cached": true})
			return
		}
	}
	s.mu.Unlock()
	if rep := a.loadCachedAudit(r.Context(), key, sig, now); rep != nil {
		s.mu.Lock()
		created, _ := time.Parse(time.RFC3339, rep.CreatedAt)
		s.jobs[rep.ID] = &auditJob{ID: rep.ID, Key: key, Status: "done", Step: 5, Report: rep, created: created}
		s.byKey[key] = rep.ID
		s.mu.Unlock()
		writeJSON(w, http.StatusOK, map[string]any{"id": rep.ID, "cached": true})
		return
	}

	s.mu.Lock()
	// 同一域名正在测评时，合并到同一个任务。
	for _, j := range s.jobs {
		if j.Key == key && (j.Status == "queued" || j.Status == "running") {
			s.mu.Unlock()
			writeJSON(w, http.StatusAccepted, map[string]any{"id": j.ID})
			return
		}
	}
	if a.gemini != nil && !s.takeBudget(now, a.cfg.AuditDailyLimit) {
		s.mu.Unlock()
		writeError(w, http.StatusTooManyRequests, "budget_exhausted", "今日免费测评名额已用完，请明天再试，或预约诊断会")
		return
	}
	job := &auditJob{ID: newAuditID(), Key: key, Status: "queued", created: now}
	s.jobs[job.ID] = job
	s.mu.Unlock()

	go a.runAudit(job, domain)
	writeJSON(w, http.StatusAccepted, map[string]any{"id": job.ID})
}

func (a *App) handleGetAudit(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !auditIDRe.MatchString(id) {
		writeError(w, http.StatusNotFound, "not_found", "测评不存在或已过期")
		return
	}
	j, ok := a.audits.snapshot(id)
	if !ok {
		rep := a.loadAuditByID(r.Context(), id)
		if rep == nil {
			writeError(w, http.StatusNotFound, "not_found", "测评不存在或已过期")
			return
		}
		j = auditJob{ID: id, Status: "done", Step: 5, Report: rep}
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id":      j.ID,
		"status":  j.Status,
		"step":    j.Step,
		"done":    j.Done,
		"total":   j.Total,
		"engines": j.Engines,
		"error":   j.Err,
		"report":  j.Report,
	})
}

// ---------- 持久化（可选：未配置数据库时只存内存） ----------

func (a *App) saveAudit(rep *AuditReport, key string) {
	if a.db == nil {
		return
	}
	buf, err := json.Marshal(rep)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err = a.db.ExecContext(ctx, `INSERT INTO audits (id, target_key, mode, total_score, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
		rep.ID, key, rep.Mode, rep.TotalScore, string(buf), time.Now().UTC())
	if err != nil {
		log.Printf("保存测评结果失败: %v", err)
	}
}

func (a *App) scanAudit(row *sql.Row) *AuditReport {
	var raw string
	if err := row.Scan(&raw); err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("读取测评结果失败: %v", err)
		}
		return nil
	}
	var rep AuditReport
	if json.Unmarshal([]byte(raw), &rep) != nil {
		return nil
	}
	return &rep
}

// loadCachedAudit 只复用真实探测（live）且探测平台相同的结果，示例与失败结果不缓存。
func (a *App) loadCachedAudit(ctx context.Context, key, sig string, now time.Time) *AuditReport {
	if a.db == nil {
		return nil
	}
	rep := a.scanAudit(a.db.QueryRowContext(ctx,
		`SELECT result_json FROM audits WHERE target_key = ? AND mode = 'live' AND created_at > ? ORDER BY created_at DESC LIMIT 1`,
		key, now.Add(-auditCacheTTL)))
	if rep == nil || rep.EngineSet != sig {
		return nil
	}
	return rep
}

func (a *App) loadAuditByID(ctx context.Context, id string) *AuditReport {
	if a.db == nil {
		return nil
	}
	return a.scanAudit(a.db.QueryRowContext(ctx, `SELECT result_json FROM audits WHERE id = ?`, id))
}

// ---------- 执行 ----------

// activeEngines 是本次测评实际提问的平台。分析依赖 Gemini，未配置 Gemini 时返回空（只出示例）。
func (a *App) activeEngines() []probeEngine {
	if a.gemini == nil {
		return nil
	}
	return a.probeEngines()
}

func (a *App) auditEngineIDs() []string {
	ids := []string{}
	for _, e := range a.activeEngines() {
		ids = append(ids, e.ID())
	}
	return ids
}

func (a *App) runAudit(job *auditJob, domain string) {
	s := a.audits
	defer func() {
		if p := recover(); p != nil {
			log.Printf("测评任务异常: %v\n%s", p, debug.Stack())
			s.update(job, func(j *auditJob) { j.Status, j.Err = "failed", "测评失败，请稍后重试" })
		}
	}()
	s.sem <- struct{}{}
	defer func() { <-s.sem }()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	setStep := func(n int) { s.update(job, func(j *auditJob) { j.Status, j.Step = "running", n }) }

	// ① 官网检查
	setStep(1)
	site := checkSite(ctx, domain)

	// ② 识别品牌、行业与市场
	setStep(2)
	entity := a.identifyEntity(ctx, domain, site)

	engines := a.activeEngines()
	names := make([]string, len(engines))
	for i, e := range engines {
		names[i] = e.Name()
	}
	rep := &AuditReport{ID: job.ID, Domain: domain, Entity: entity, Site: site, Engine: strings.Join(names, "、"), EngineSet: engineSignature(engines),
		Samples: auditSamples, CreatedAt: time.Now().UTC().Format(time.RFC3339), Engines: []auditEngineResult{},
		ShareOfVoice: []auditVoice{}, Evidence: []auditEvidence{}}

	if len(engines) == 0 {
		setStep(5)
		fillSampleAI(rep)
	} else {
		// ③ 生成买家问题
		setStep(3)
		questions := a.buildQuestions(ctx, entity, domain)
		rep.Questions = len(questions)

		// ④ 真实提问
		s.update(job, func(j *auditJob) { j.Engines = names })
		setStep(4)
		answers := a.probe(ctx, job, engines, questions)

		// ⑤ 分析与评分
		setStep(5)
		ok := 0
		for _, ans := range answers {
			if ans.err == nil {
				ok++
			}
		}
		if ok == 0 {
			rep.Mode = "site_only"
		} else {
			rep.Mode = "live"
			a.analyze(ctx, rep, engines, answers, domain)
		}
	}
	finishReport(rep)

	s.update(job, func(j *auditJob) { j.Status, j.Report = "done", rep })
	s.mu.Lock()
	if rep.Mode == "live" {
		s.byKey[job.Key] = job.ID
	}
	s.mu.Unlock()
	a.saveAudit(rep, job.Key)
}

// ---------- ② 品牌识别 ----------

var industryRules = []struct {
	re     *regexp.Regexp
	zh, en string
}{
	{regexp.MustCompile(`medical|health|ortho|implant|pharma|dental|surgical|bio`), "医疗器械与生物耗材", "medical devices"},
	{regexp.MustCompile(`solar|energy|battery|inverter|power|pv`), "新能源与光伏储能", "solar and energy storage equipment"},
	{regexp.MustCompile(`water|pump|valve|drain|rain|environ|filter`), "环保工程与水务装备", "water treatment and drainage equipment"},
	{regexp.MustCompile(`auto|vehicle|truck|machinery|excavat|crane|motor`), "汽车零部件与工程机械", "auto parts and machinery"},
	{regexp.MustCompile(`hardware|fastener|screw|bolt|metal|cnc|mould|mold|tool`), "精密五金与离散工业", "precision hardware and metal parts"},
}

func guessMarket(domain string) (zh, en string) {
	tld := domain[strings.LastIndex(domain, ".")+1:]
	switch tld {
	case "de", "fr", "it", "es", "nl", "eu", "uk", "pl", "se", "ch", "at", "be", "dk", "no", "fi":
		return "欧洲市场", "Europe"
	case "us", "ca":
		return "北美市场", "North America"
	case "sg", "my", "th", "vn", "id", "ph", "ae", "sa", "qa":
		return "东南亚及中东市场", "Southeast Asia and the Middle East"
	}
	return "欧美核心市场（北美 + 欧洲）", "the US and Europe"
}

// domainLabel 取域名的第一段作为品牌的粗略写法，如 www.ak-medical.com → ak-medical。
func domainLabel(domain string) string {
	root := strings.TrimPrefix(domain, "www.")
	if i := strings.Index(root, "."); i > 0 {
		return root[:i]
	}
	return root
}

// heuristicEntity 在没有模型或模型失败时，根据域名与页面标题做粗略判断。
func heuristicEntity(domain string, site *SiteCheck) auditEntity {
	label := domainLabel(domain)
	brand := strings.ToUpper(label[:1]) + label[1:]
	hay := strings.ToLower(domain + " " + site.Title + " " + site.Description)
	e := auditEntity{Brand: brand, Aliases: []string{}, Industry: "工业制造出海", CategoryEn: "industrial products", Products: []string{}}
	for _, r := range industryRules {
		if r.re.MatchString(hay) {
			e.Industry, e.CategoryEn = r.zh, r.en
			break
		}
	}
	e.Market, e.MarketEn = guessMarket(domain)
	return e
}

// parseModelJSON 解析模型的 JSON 输出，兼容偶尔带 ``` 代码块的情况。
func parseModelJSON(text string, dst any) error {
	t := strings.TrimSpace(text)
	t = strings.TrimPrefix(t, "```json")
	t = strings.TrimPrefix(t, "```")
	t = strings.TrimSuffix(t, "```")
	return json.Unmarshal([]byte(strings.TrimSpace(t)), dst)
}

func (a *App) identifyEntity(ctx context.Context, domain string, site *SiteCheck) auditEntity {
	fb := heuristicEntity(domain, site)
	if a.gemini == nil {
		return fb
	}
	page := "（官网无法访问，只能根据域名判断）"
	if site.Reachable {
		page = fmt.Sprintf("标题：%s\n描述：%s\n正文节选：%s", site.Title, site.Description, clip(site.text, 3000))
	}
	prompt := fmt.Sprintf(`你是 B2B 出海行业分析师。根据下面的企业官网信息，识别企业品牌与业务。
域名：%s
%s

只返回 JSON：
{
  "brand": "官网上使用的品牌名（优先英文）",
  "aliases": ["其他写法、中文名、缩写，最多 4 个，不含与 brand 相同的写法"],
  "industry": "所属行业（简体中文，10 字以内）",
  "categoryEn": "主营品类的英文说法，海外采购商会这样称呼（2~6 个词）",
  "products": ["核心产品的英文名，最多 4 个"],
  "market": "主要目标市场（简体中文，如 欧洲市场、北美市场）",
  "marketEn": "主要目标市场的英文（如 Europe、the US）"
}`, domain, page)
	cctx, cancel := context.WithTimeout(ctx, 40*time.Second)
	defer cancel()
	text, err := a.gemini.GenerateJSON(cctx, "", prompt, 0.2)
	var e auditEntity
	if err != nil || parseModelJSON(text, &e) != nil || strings.TrimSpace(e.Brand) == "" || strings.TrimSpace(e.CategoryEn) == "" {
		if err != nil {
			log.Printf("测评品牌识别失败: %v", err)
		}
		return fb
	}
	e.Brand = clip(e.Brand, 60)
	e.Industry = orDefault(clip(e.Industry, 30), fb.Industry)
	e.CategoryEn = clip(e.CategoryEn, 80)
	e.Market = orDefault(clip(e.Market, 30), fb.Market)
	e.MarketEn = orDefault(clip(e.MarketEn, 40), fb.MarketEn)
	e.Aliases = cleanList(e.Aliases, 4, 60)
	e.Products = cleanList(e.Products, 4, 80)
	return e
}

func cleanList(in []string, max, n int) []string {
	out := []string{}
	for _, s := range in {
		if s = clip(s, n); s != "" && len(out) < max {
			out = append(out, s)
		}
	}
	return out
}

// ---------- ③ 买家问题 ----------

type auditQuestion struct {
	Text    string
	Branded bool
}

func fallbackQuestions(e auditEntity) []string {
	c, m := e.CategoryEn, e.MarketEn
	return []string{
		fmt.Sprintf("Who are the leading manufacturers of %s?", c),
		fmt.Sprintf("Recommend reliable %s suppliers from China for buyers in %s.", c, m),
		fmt.Sprintf("Which %s manufacturers have international certifications such as ISO and CE?", c),
		fmt.Sprintf("Best %s suppliers for B2B wholesale and OEM orders", c),
		fmt.Sprintf("Compare the top %s brands on quality, price and lead time.", c),
		fmt.Sprintf("I need a %s supplier for a project in %s. Which companies should I shortlist?", c, m),
	}
}

func (a *App) buildQuestions(ctx context.Context, e auditEntity, domain string) []auditQuestion {
	unbranded := fallbackQuestions(e)
	prompt := fmt.Sprintf(`Write %d questions that a B2B buyer (procurement manager or engineer) in %s would type into an AI assistant such as ChatGPT or Perplexity when looking for suppliers of %s (products: %s).
Rules:
- Natural English, one sentence each, varied intent: supplier recommendations, comparisons, certifications and compliance, technical specs, sourcing from China.
- Never mention any specific company or brand name.
Return JSON only: {"questions": ["..."]}`, auditUnbranded, e.MarketEn, e.CategoryEn, strings.Join(e.Products, ", "))
	cctx, cancel := context.WithTimeout(ctx, 40*time.Second)
	defer cancel()
	var out struct {
		Questions []string `json:"questions"`
	}
	if text, err := a.gemini.GenerateJSON(cctx, "", prompt, 0.4); err == nil && parseModelJSON(text, &out) == nil {
		qs := cleanList(out.Questions, auditUnbranded, 300)
		if len(qs) == auditUnbranded {
			unbranded = qs
		}
	} else if err != nil {
		log.Printf("测评问题生成失败: %v", err)
	}

	qs := make([]auditQuestion, 0, auditUnbranded+2)
	for _, q := range unbranded {
		qs = append(qs, auditQuestion{Text: q})
	}
	// 带品牌名的问题用固定模板，测的是 AI 对品牌本身的认知。
	qs = append(qs,
		auditQuestion{Text: fmt.Sprintf("What do you know about %s (%s)? What products do they make?", e.Brand, domain), Branded: true},
		auditQuestion{Text: fmt.Sprintf("Is %s a reliable supplier of %s? What are its strengths and weaknesses?", e.Brand, e.CategoryEn), Branded: true},
	)
	return qs
}

// ---------- ④ 提问 ----------

type auditAnswer struct {
	engine  probeEngine
	q       auditQuestion
	text    string
	sources []WebSource
	err     error
}

// probe 向每个平台提出全部问题，每题问 auditSamples 次。各平台单独限制并发，互不拖累。
func (a *App) probe(ctx context.Context, job *auditJob, engines []probeEngine, qs []auditQuestion) []auditAnswer {
	total := len(engines) * len(qs) * auditSamples
	a.audits.update(job, func(j *auditJob) { j.Total, j.Done = total, 0 })
	answers := make([]auditAnswer, total)
	var wg sync.WaitGroup
	idx := 0
	for _, eng := range engines {
		sem := make(chan struct{}, auditConcurrency)
		for _, q := range qs {
			for s := 0; s < auditSamples; s++ {
				wg.Add(1)
				go func(i int, eng probeEngine, q auditQuestion) {
					defer wg.Done()
					sem <- struct{}{}
					defer func() { <-sem }()
					cctx, cancel := context.WithTimeout(ctx, 90*time.Second)
					defer cancel()
					text, sources, err := eng.Ask(cctx, q.Text)
					if err == nil && strings.TrimSpace(text) == "" {
						err = errors.New("empty answer")
					}
					if err != nil {
						log.Printf("测评提问失败（%s）: %v", eng.ID(), err)
					}
					answers[i] = auditAnswer{engine: eng, q: q, text: text, sources: sources, err: err}
					a.audits.update(job, func(j *auditJob) { j.Done++ })
				}(idx, eng, q)
				idx++
			}
		}
	}
	wg.Wait()
	return answers
}

// ---------- ⑤ 分析 ----------

type answerFacts struct {
	I          int      `json:"i"`
	Mentioned  bool     `json:"mentioned"`
	Position   int      `json:"position"`
	Sentiment  string   `json:"sentiment"`
	KnowsBrand bool     `json:"knowsBrand"`
	Brands     []string `json:"brands"`
}

// brandTerms 是用来在回答里做字符串匹配的品牌写法。
func brandTerms(e auditEntity, domain string) []string {
	terms := []string{strings.TrimPrefix(domain, "www.")}
	for _, t := range append([]string{domainLabel(domain), e.Brand}, e.Aliases...) {
		t = strings.TrimSpace(t)
		// 英文写法至少 3 个字符，中文名至少 2 个字，避免短缩写误匹配。
		if n := len([]rune(t)); n >= 3 || (n == 2 && asciiRatio(t) == 0) {
			terms = append(terms, t)
		}
	}
	return terms
}

func containsAnyFold(s string, terms []string) bool {
	ls := strings.ToLower(s)
	for _, t := range terms {
		if t != "" && strings.Contains(ls, strings.ToLower(t)) {
			return true
		}
	}
	return false
}

// extractFacts 让模型从一组回答里抽取事实（不打分）。idx 是 answers 中要分析的下标，结果按下标返回。
func (a *App) extractFacts(ctx context.Context, e auditEntity, domain string, answers []auditAnswer, idx []int) map[int]answerFacts {
	out := map[int]answerFacts{}
	var sb strings.Builder
	for _, i := range idx {
		if answers[i].err == nil {
			fmt.Fprintf(&sb, "\n### ANSWER %d\nQuestion: %s\nAnswer:\n%s\n", i, answers[i].q.Text, clip(answers[i].text, 2500))
		}
	}
	if sb.Len() == 0 {
		return out
	}
	prompt := fmt.Sprintf(`You are auditing how AI assistants talk about a company.
Target company: %s (website %s; other names: %s)

For every answer below, extract facts. Return JSON only:
{"results": [{"i": <answer number>, "mentioned": <true if the target company is mentioned>, "position": <1-based position of the target company among the companies the answer recommends or lists, 0 if not listed>, "sentiment": "positive|neutral|negative (how the answer describes the target company; neutral if not mentioned)", "knowsBrand": <true only if the answer gives specific, concrete information about the target company itself rather than saying it has no information or talking generically>, "brands": ["company or brand names the answer recommends or lists, in order, at most 10; exclude marketplaces, directories and media such as Alibaba, Made-in-China, Thomasnet, Wikipedia"]}]}
%s`, e.Brand, domain, strings.Join(e.Aliases, ", "), sb.String())
	cctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	text, err := a.gemini.GenerateJSON(cctx, "", prompt, 0)
	if err != nil {
		log.Printf("测评结果分析失败: %v", err)
		return out
	}
	var parsed struct {
		Results []answerFacts `json:"results"`
	}
	if parseModelJSON(text, &parsed) != nil {
		return out
	}
	for _, f := range parsed.Results {
		out[f.I] = f
	}
	return out
}

type engineTally struct {
	unbranded, mentionedU, all, cited, branded, knows, posCount, failed int
	posSum                                                              float64
}

func pct(n, d int) int {
	if d == 0 {
		return 0
	}
	return int(math.Round(100 * float64(n) / float64(d)))
}

func avgPos(sum float64, n int) float64 {
	if n == 0 {
		return 0
	}
	return math.Round(sum/float64(n)*10) / 10
}

func (a *App) analyze(ctx context.Context, rep *AuditReport, engines []probeEngine, answers []auditAnswer, domain string) {
	e := rep.Entity
	terms := brandTerms(e, domain)
	root := strings.ToLower(strings.TrimPrefix(domain, "www."))

	// 按平台分组，各平台的分析并行进行，单次提示词不会过长。
	groups := map[string][]int{}
	for i, ans := range answers {
		groups[ans.engine.ID()] = append(groups[ans.engine.ID()], i)
	}
	facts := map[int]answerFacts{}
	var mu sync.Mutex
	var wg sync.WaitGroup
	for _, idx := range groups {
		wg.Add(1)
		go func(idx []int) {
			defer wg.Done()
			got := a.extractFacts(ctx, e, domain, answers, idx)
			mu.Lock()
			for k, v := range got {
				facts[k] = v
			}
			mu.Unlock()
		}(idx)
	}
	wg.Wait()

	tallies := map[string]*engineTally{}
	for _, eng := range engines {
		tallies[eng.ID()] = &engineTally{}
	}
	var total engineTally
	voice := map[string]*auditVoice{}

	for i, ans := range answers {
		t := tallies[ans.engine.ID()]
		if ans.err != nil {
			t.failed++
			continue
		}
		f, analyzed := facts[i]
		mentioned := containsAnyFold(ans.text, terms) || f.Mentioned
		ownCited := false
		sources := []WebSource{}
		seenSrc := map[string]bool{}
		for _, src := range ans.sources {
			if strings.Contains(strings.ToLower(src.Domain+" "+src.Title+" "+src.URI), root) {
				ownCited = true
			}
			k := strings.ToLower(orDefault(src.Domain, src.Title))
			if !seenSrc[k] && len(sources) < 6 {
				seenSrc[k] = true
				sources = append(sources, src)
			}
		}
		pos := 0
		if mentioned && f.Position > 0 {
			pos = f.Position
		}
		for _, x := range []*engineTally{t, &total} {
			x.all++
			if ownCited {
				x.cited++
			}
			if ans.q.Branded {
				x.branded++
				// 模型分析失败时，退化为「回答里出现了品牌名」。
				if (analyzed && f.KnowsBrand) || (!analyzed && mentioned) {
					x.knows++
				}
			} else {
				x.unbranded++
				if mentioned {
					x.mentionedU++
					if pos > 0 {
						x.posSum += float64(pos)
						x.posCount++
					}
				}
			}
		}
		if !ans.q.Branded {
			seenBrand := map[string]bool{}
			for _, b := range f.Brands {
				b = clip(b, 60)
				k := strings.ToLower(b)
				if b == "" || seenBrand[k] || containsAnyFold(b, terms) {
					continue
				}
				seenBrand[k] = true
				if voice[k] == nil {
					voice[k] = &auditVoice{Name: b}
				}
				voice[k].Mentions++
			}
		}
		sentiment := f.Sentiment
		if sentiment != "positive" && sentiment != "negative" {
			sentiment = "neutral"
		}
		rep.Evidence = append(rep.Evidence, auditEvidence{Engine: ans.engine.Name(), Question: ans.q.Text, Branded: ans.q.Branded,
			Answer: clip(ans.text, 1500), Mentioned: mentioned, Position: pos, Sentiment: sentiment, OwnCited: ownCited, Sources: sources})
	}

	// 各平台分别计算；总体指标取有效平台的平均值，让每个平台权重相同。
	var sumM, sumC, sumK, n int
	for _, eng := range engines {
		t := tallies[eng.ID()]
		r := auditEngineResult{ID: eng.ID(), Name: eng.Name(), Answers: t.all, Failed: t.failed}
		if t.all > 0 {
			r.MentionRate = pct(t.mentionedU, t.unbranded)
			r.CitationRate = pct(t.cited, t.all)
			r.BrandKnowledge = pct(t.knows, t.branded)
			r.AvgPosition = avgPos(t.posSum, t.posCount)
			sumM, sumC, sumK, n = sumM+r.MentionRate, sumC+r.CitationRate, sumK+r.BrandKnowledge, n+1
		}
		rep.Engines = append(rep.Engines, r)
	}
	if n > 0 {
		rep.Metrics.MentionRate = int(math.Round(float64(sumM) / float64(n)))
		rep.Metrics.CitationRate = int(math.Round(float64(sumC) / float64(n)))
		rep.Metrics.BrandKnowledge = int(math.Round(float64(sumK) / float64(n)))
	}
	rep.Metrics.AvgPosition = avgPos(total.posSum, total.posCount)
	rep.Answers = total.all
	rep.unbrandedAnswers = total.unbranded

	// 声量：只统计不带品牌名的问题，取被提及最多的竞品与自身对比。
	list := make([]auditVoice, 0, len(voice))
	for _, v := range voice {
		list = append(list, *v)
	}
	sort.Slice(list, func(i, j int) bool {
		if list[i].Mentions != list[j].Mentions {
			return list[i].Mentions > list[j].Mentions
		}
		return list[i].Name < list[j].Name
	})
	if len(list) > 6 {
		list = list[:6]
	}
	list = append(list, auditVoice{Name: e.Brand, Mentions: total.mentionedU, IsSelf: true})
	sort.SliceStable(list, func(i, j int) bool { return list[i].Mentions > list[j].Mentions })
	rep.ShareOfVoice = list

	// 证据排序：先放提到品牌的回答，再放不带品牌名的问题；同类保持平台顺序。
	sort.SliceStable(rep.Evidence, func(i, j int) bool {
		x, y := rep.Evidence[i], rep.Evidence[j]
		if x.Mentioned != y.Mentioned {
			return x.Mentioned
		}
		return !x.Branded && y.Branded
	})
}

// fillSampleAI：未配置模型时的确定性示例，前端会明确标注「示例数据」。
func fillSampleAI(rep *AuditReport) {
	rep.Mode = "sample"
	rep.Questions = auditUnbranded + 2
	rep.Engines = []auditEngineResult{
		{ID: "openai", Name: "ChatGPT", Answers: 16, MentionRate: 17, CitationRate: 6, BrandKnowledge: 50, AvgPosition: 5},
		{ID: "perplexity", Name: "Perplexity", Answers: 16, MentionRate: 33, CitationRate: 13, BrandKnowledge: 50, AvgPosition: 4},
		{ID: "gemini", Name: "Gemini", Answers: 16, MentionRate: 0, CitationRate: 0, BrandKnowledge: 50},
	}
	rep.Engine = "ChatGPT、Perplexity、Gemini"
	rep.Answers = 48
	rep.unbrandedAnswers = 36
	rep.Metrics = auditMetrics{MentionRate: 17, CitationRate: 6, BrandKnowledge: 50, AvgPosition: 4.5}
	rep.ShareOfVoice = []auditVoice{
		{Name: "国际头部品牌 A", Mentions: 28},
		{Name: "欧洲品牌 B", Mentions: 21},
		{Name: "区域品牌 C", Mentions: 12},
		{Name: rep.Entity.Brand, Mentions: 6, IsSelf: true},
	}
	q := fallbackQuestions(rep.Entity)[0]
	rep.Evidence = []auditEvidence{{
		Engine:    "ChatGPT",
		Question:  q,
		Answer:    "（示例）Leading manufacturers include several established global brands. Some Chinese suppliers are also active in export markets, but detailed technical documentation for them is limited in public sources.",
		Sentiment: "neutral",
		Sources:   []WebSource{},
	}}
}

// ---------- 汇总、发现与建议 ----------

func finishReport(rep *AuditReport) {
	m := &rep.Metrics
	site := rep.Site
	m.Readability = site.Score

	if rep.Mode == "site_only" {
		rep.TotalScore = site.Score
	} else {
		ai := 0.5*float64(m.MentionRate) + 0.2*float64(m.CitationRate) + 0.3*float64(m.BrandKnowledge)
		rep.TotalScore = int(math.Round(0.7*ai + 0.3*float64(site.Score)))
	}
	switch {
	case rep.TotalScore >= 75:
		rep.Level = "表现良好"
	case rep.TotalScore >= 50:
		rep.Level = "有基础，仍有明显短板"
	default:
		rep.Level = "待改进"
	}

	var issues, goods []string
	brand := rep.Entity.Brand

	if rep.Mode != "site_only" {
		line := fmt.Sprintf("GEO：以海外买家身份向 %s 提出 %d 个不带品牌名的采购问题（共 %d 次回答），平均 %d%% 的回答提到了 %s",
			rep.Engine, auditUnbranded, rep.unbrandedAnswers, m.MentionRate, brand)
		if len(rep.Engines) > 1 {
			var parts []string
			for _, e := range rep.Engines {
				if e.Answers > 0 {
					parts = append(parts, fmt.Sprintf("%s %d%%", e.Name, e.MentionRate))
				}
			}
			line += "（" + strings.Join(parts, "、") + "）"
		}
		if m.AvgPosition > 0 {
			line += fmt.Sprintf("，平均排在第 %.1f 位", m.AvgPosition)
		}
		var top []string
		for _, v := range rep.ShareOfVoice {
			if !v.IsSelf && len(top) < 3 {
				top = append(top, v.Name)
			}
		}
		if m.MentionRate < 50 && len(top) > 0 {
			line += "；被推荐最多的是 " + strings.Join(top, "、")
		}
		if m.MentionRate >= 50 {
			goods = append(goods, line)
		} else {
			issues = append(issues, line)
		}
		if m.CitationRate == 0 {
			issues = append(issues, "引用：AI 回答引用的网页里没有出现官网，AI 的判断依据来自第三方网站")
		} else {
			goods = append(goods, fmt.Sprintf("引用：%d%% 的回答把官网列为引用来源", m.CitationRate))
		}
		if m.BrandKnowledge < 50 {
			issues = append(issues, fmt.Sprintf("品牌认知：直接询问 %s 时，AI 大多给不出具体的产品与资质信息", brand))
		} else {
			goods = append(goods, fmt.Sprintf("品牌认知：直接询问 %s 时，AI 能给出具体介绍", brand))
		}
	}

	if !site.Reachable {
		issues = append(issues, "官网："+orDefault(site.Error, "无法访问")+"，AI 爬虫同样无法读取")
	} else {
		var blocked []string
		for _, c := range site.Crawlers {
			if !c.Allowed {
				blocked = append(blocked, c.Agent)
			}
		}
		if len(blocked) > 0 {
			issues = append(issues, "爬虫权限：robots.txt 屏蔽了 "+strings.Join(blocked, "、")+"，对应的 AI 读不到官网内容")
		} else {
			goods = append(goods, "爬虫权限：robots.txt 没有屏蔽主流 AI 爬虫")
		}
		if site.TextChars < 500 {
			issues = append(issues, fmt.Sprintf("页面内容：首页不执行 JavaScript 时只有约 %d 字正文，多数 AI 爬虫不执行 JavaScript，读到的内容很少", site.TextChars))
		}
		if !site.English {
			issues = append(issues, "语言：首页不是英文，海外买家用英文提问时难以匹配到官网")
		}
		if len(site.SchemaTypes) == 0 {
			issues = append(issues, "结构化数据：未发现 Organization、Product 等 Schema 标记，AI 难以准确识别企业与产品")
		}
		if !site.HasLlmsTxt {
			issues = append(issues, "llms.txt：官网没有提供给 AI 阅读的内容索引")
		}
		if site.TTFBMs >= 2000 {
			issues = append(issues, fmt.Sprintf("速度：从测评服务器访问首页，首字节耗时约 %.1f 秒", float64(site.TTFBMs)/1000))
		}
	}

	rep.Findings = append(issues, goods...)
	if len(rep.Findings) > 7 {
		rep.Findings = rep.Findings[:7]
	}

	switch {
	case !site.Reachable || site.Score < 50:
		rep.Advice = "先把官网改造成 AI 读得懂的样子：放开 AI 爬虫、服务端输出英文正文、补齐结构化数据；再做 GEO 信源建设，提高被 AI 推荐的机会。"
	case rep.Mode != "site_only" && m.MentionRate < 30:
		rep.Advice = "官网基础尚可，但 AI 推荐供应商时很少提到你。建议从 GEO 优化入手：围绕买家问题发布英文技术资料，并在行业媒体与目录建立第三方信源，每月复测。"
	case rep.Mode != "site_only" && m.CitationRate < 20:
		rep.Advice = "AI 已经知道你，但很少引用官网。建议补充可被引用的英文技术页面（参数表、认证、应用案例），让 AI 的回答以官网为依据。"
	default:
		rep.Advice = "整体表现不错。建议持续扩展多语种内容与问题覆盖面，并定期复测，跟踪竞品变化。"
	}
}
