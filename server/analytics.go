package main

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ---------- 站点识别与跨域 ----------

// siteByKey 按公开的 site_key 取站点；返回 id 与域名。
func (a *App) siteByKey(r *http.Request, key string) (id int64, domain string, err error) {
	if !siteKeyRe.MatchString(key) {
		return 0, "", sql.ErrNoRows
	}
	err = a.db.QueryRowContext(r.Context(), `SELECT id, domain FROM sites WHERE site_key = ?`, key).Scan(&id, &domain)
	return
}

var siteKeyRe = regexp.MustCompile(`^sk_[0-9a-f]{24}$`)

// originAllowed：Origin 的主机必须是站点域名本身、其子域名，或 www 与裸域互换。
func originAllowed(origin, domain string) bool {
	u, err := url.Parse(origin)
	if err != nil || u.Hostname() == "" {
		return false
	}
	h := strings.ToLower(u.Hostname())
	bare := strings.TrimPrefix(domain, "www.")
	return h == domain || h == bare || strings.HasSuffix(h, "."+bare)
}

// publicCORS 处理公开接口的跨域：有 Origin 时必须匹配站点域名（服务端到服务端调用没有 Origin，放行）。
func publicCORS(w http.ResponseWriter, r *http.Request, domain string) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	if !originAllowed(origin, domain) {
		writeError(w, http.StatusForbidden, "origin_not_allowed", "来源域名与站点不匹配")
		return false
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Vary", "Origin")
	return true
}

// publicPreflight：预检请求不带站点信息，只声明允许的方法与头；真正的请求仍会校验来源。
func publicPreflight(w http.ResponseWriter, r *http.Request) {
	h := w.Header()
	h.Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	h.Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	h.Set("Access-Control-Allow-Headers", "Content-Type")
	h.Set("Access-Control-Max-Age", "86400")
	h.Set("Vary", "Origin")
	w.WriteHeader(http.StatusNoContent)
}

func clip(s string, n int) string {
	s = strings.TrimSpace(s)
	if r := []rune(s); len(r) > n {
		return string(r[:n])
	}
	return s
}

func deviceOf(ua string) string {
	ua = strings.ToLower(ua)
	switch {
	case strings.Contains(ua, "ipad") || strings.Contains(ua, "tablet"):
		return "tablet"
	case strings.Contains(ua, "mobi") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone"):
		return "mobile"
	}
	return "desktop"
}

var visitorRe = regexp.MustCompile(`^[A-Za-z0-9_-]{8,40}$`)

// ---------- 公开接口：访问采集 ----------

// handleCollect 接收浏览器脚本上报的页面浏览。用 text/plain 也能解析，方便 sendBeacon 免预检。
func (a *App) handleCollect(w http.ResponseWriter, r *http.Request) {
	if a.db == nil {
		writeError(w, http.StatusServiceUnavailable, "db_unavailable", "数据库未配置")
		return
	}
	var req struct {
		SiteKey  string `json:"siteKey"`
		Visitor  string `json:"visitorId"`
		Path     string `json:"path"`
		Referrer string `json:"referrer"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	siteID, domain, err := a.siteByKey(r, req.SiteKey)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "unknown_site", "站点标识无效")
		return
	}
	if err != nil {
		internalError(w)
		return
	}
	if !publicCORS(w, r, domain) {
		return
	}
	if !a.collectLimiter.allow(a.clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "rate_limited", "请求过于频繁")
		return
	}
	if !visitorRe.MatchString(req.Visitor) {
		writeError(w, http.StatusBadRequest, "bad_request", "visitorId 格式不正确")
		return
	}
	path := clip(req.Path, 512)
	if path == "" || path[0] != '/' {
		path = "/" + path
	}
	ref := ""
	if u, err := url.Parse(req.Referrer); err == nil && u.Hostname() != "" && !originAllowed(req.Referrer, domain) {
		ref = clip(strings.ToLower(u.Hostname()), 255) // 站外来源只存主机名；站内跳转不算来源
	}
	if _, err := a.db.ExecContext(r.Context(), `INSERT INTO visits (site_id, visitor_id, path, referrer, device, created_at) VALUES (?,?,?,?,?,?)`,
		siteID, req.Visitor, path, ref, deviceOf(r.UserAgent()), time.Now().UTC()); err != nil {
		internalError(w)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---------- 公开接口：提交线索 ----------

var phoneRe = regexp.MustCompile(`^[0-9+\-() ]{6,32}$`)

func (a *App) handleSubmitLead(w http.ResponseWriter, r *http.Request) {
	if a.db == nil {
		writeError(w, http.StatusServiceUnavailable, "db_unavailable", "数据库未配置")
		return
	}
	var req struct {
		SiteKey    string `json:"siteKey"`
		Name       string `json:"name"`
		Phone      string `json:"phone"`
		Email      string `json:"email"`
		Company    string `json:"company"`
		Message    string `json:"message"`
		SourcePage string `json:"sourcePage"`
		Visitor    string `json:"visitorId"`
		Website    string `json:"website"` // 蜜罐：真人看不见，机器人会填
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	siteID, domain, err := a.siteByKey(r, req.SiteKey)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "unknown_site", "站点标识无效")
		return
	}
	if err != nil {
		internalError(w)
		return
	}
	if !publicCORS(w, r, domain) {
		return
	}
	if !a.leadLimiter.allow(a.clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "rate_limited", "提交过于频繁，请稍后再试")
		return
	}
	if req.Website != "" { // 蜜罐命中：假装成功，不入库
		writeJSON(w, http.StatusCreated, map[string]any{"ok": true})
		return
	}
	phone, email := strings.TrimSpace(req.Phone), strings.ToLower(strings.TrimSpace(req.Email))
	switch {
	case phone == "" && email == "":
		writeError(w, http.StatusBadRequest, "bad_request", "请至少留下手机号或邮箱")
		return
	case phone != "" && !phoneRe.MatchString(phone):
		writeError(w, http.StatusBadRequest, "bad_request", "手机号格式不正确")
		return
	case email != "" && !isEmail(email):
		writeError(w, http.StatusBadRequest, "bad_request", "邮箱格式不正确")
		return
	}
	visitor := req.Visitor
	if !visitorRe.MatchString(visitor) {
		visitor = ""
	}
	now := time.Now().UTC()
	res, err := a.db.ExecContext(r.Context(), `INSERT INTO leads
		(site_id, name, phone, email, company, message, source_page, visitor_id, ip, user_agent, created_at, updated_at)
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		siteID, clip(req.Name, 64), phone, email, clip(req.Company, 128), clip(req.Message, 2000),
		clip(req.SourcePage, 512), visitor, a.clientIP(r), clip(r.UserAgent(), 255), now, now)
	if err != nil {
		internalError(w)
		return
	}
	id, _ := res.LastInsertId()
	writeJSON(w, http.StatusCreated, map[string]any{"ok": true, "id": id})
}

func isEmail(s string) bool {
	e, err := normalizeEmail(s)
	return err == nil && e == s
}

// ---------- 客户接口：统计与线索（均经 site_members 隔离） ----------

// siteAccess 校验当前用户能否访问该站点：管理员全部，客户只限授权站点。
func (a *App) siteAccess(r *http.Request, u *authedUser, siteID int64) (bool, error) {
	var n int
	var err error
	if u.Role == "admin" {
		err = a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM sites WHERE id = ?`, siteID).Scan(&n)
	} else {
		err = a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM site_members WHERE site_id = ? AND user_id = ?`, siteID, u.ID).Scan(&n)
	}
	return n > 0, err
}

// withSite 包装 /api/sites/{id}/... 的处理函数，统一做站点权限检查（无权限一律 404，不泄露站点是否存在）。
func (a *App) withSite(h func(w http.ResponseWriter, r *http.Request, u *authedUser, siteID int64)) func(http.ResponseWriter, *http.Request, *authedUser) {
	return func(w http.ResponseWriter, r *http.Request, u *authedUser) {
		id, ok := pathID(r, "id")
		if !ok {
			writeError(w, http.StatusNotFound, "not_found", "站点不存在")
			return
		}
		okAccess, err := a.siteAccess(r, u, id)
		if err != nil {
			internalError(w)
			return
		}
		if !okAccess {
			writeError(w, http.StatusNotFound, "not_found", "站点不存在")
			return
		}
		h(w, r, u, id)
	}
}

// 统计按北京时间（UTC+8）分天。
const cnOffset = 8 * time.Hour

func (a *App) siteStats(w http.ResponseWriter, r *http.Request, _ *authedUser, siteID int64) {
	days, _ := strconv.Atoi(r.URL.Query().Get("days"))
	if days != 7 && days != 30 && days != 90 {
		days = 7
	}
	ctx := r.Context()
	nowCN := time.Now().UTC().Add(cnOffset)
	startCN := time.Date(nowCN.Year(), nowCN.Month(), nowCN.Day(), 0, 0, 0, 0, time.UTC).AddDate(0, 0, -(days - 1))
	since := startCN.Add(-cnOffset) // 换回 UTC 用于查询

	var pv, uv, leads, newLeads int64
	if err := a.db.QueryRowContext(ctx, `SELECT COUNT(*), COUNT(DISTINCT visitor_id) FROM visits WHERE site_id = ? AND created_at >= ?`, siteID, since).Scan(&pv, &uv); err != nil {
		internalError(w)
		return
	}
	if err := a.db.QueryRowContext(ctx, `SELECT COUNT(*), COALESCE(SUM(status = 'new'), 0) FROM leads WHERE site_id = ? AND created_at >= ?`, siteID, since).Scan(&leads, &newLeads); err != nil {
		internalError(w)
		return
	}

	series := map[string]map[string]int64{}
	fill := func(q string, key string) bool {
		rows, err := a.db.QueryContext(ctx, q, siteID, since)
		if err != nil {
			return false
		}
		defer rows.Close()
		for rows.Next() {
			var day string
			var a, b int64
			if rows.Scan(&day, &a, &b) != nil {
				return false
			}
			if series[day] == nil {
				series[day] = map[string]int64{}
			}
			if key == "visits" {
				series[day]["pv"], series[day]["uv"] = a, b
			} else {
				series[day]["leads"] = a
			}
		}
		return rows.Err() == nil
	}
	if !fill(`SELECT DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') d, COUNT(*), COUNT(DISTINCT visitor_id) FROM visits WHERE site_id = ? AND created_at >= ? GROUP BY d`, "visits") ||
		!fill(`SELECT DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') d, COUNT(*), 0 FROM leads WHERE site_id = ? AND created_at >= ? GROUP BY d`, "leads") {
		internalError(w)
		return
	}
	daily := make([]map[string]any, 0, days)
	for i := 0; i < days; i++ {
		d := startCN.AddDate(0, 0, i).Format("2006-01-02")
		s := series[d]
		daily = append(daily, map[string]any{"date": d, "pv": s["pv"], "uv": s["uv"], "leads": s["leads"]})
	}

	top := func(q string) []map[string]any {
		out := []map[string]any{}
		rows, err := a.db.QueryContext(ctx, q, siteID, since)
		if err != nil {
			return out
		}
		defer rows.Close()
		for rows.Next() {
			var k string
			var n int64
			if rows.Scan(&k, &n) == nil {
				out = append(out, map[string]any{"name": k, "count": n})
			}
		}
		return out
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"days": days, "pv": pv, "uv": uv, "leads": leads, "newLeads": newLeads, "daily": daily,
		"topPages":     top(`SELECT path, COUNT(*) c FROM visits WHERE site_id = ? AND created_at >= ? GROUP BY path ORDER BY c DESC LIMIT 8`),
		"topReferrers": top(`SELECT referrer, COUNT(*) c FROM visits WHERE site_id = ? AND created_at >= ? AND referrer <> '' GROUP BY referrer ORDER BY c DESC LIMIT 8`),
		"devices":      top(`SELECT device, COUNT(*) c FROM visits WHERE site_id = ? AND created_at >= ? GROUP BY device ORDER BY c DESC`),
	})
}

var leadStatuses = map[string]bool{"new": true, "contacted": true, "qualified": true, "closed": true, "invalid": true}

const leadCols = `id, name, phone, email, company, message, source_page, status, note, created_at`

func scanLeads(rows *sql.Rows) []map[string]any {
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var name, phone, email, company, msg, page, status, note string
		var created time.Time
		if rows.Scan(&id, &name, &phone, &email, &company, &msg, &page, &status, &note, &created) == nil {
			out = append(out, map[string]any{"id": id, "name": name, "phone": phone, "email": email, "company": company,
				"message": msg, "sourcePage": page, "status": status, "note": note, "createdAt": created})
		}
	}
	return out
}

func (a *App) siteLeads(w http.ResponseWriter, r *http.Request, _ *authedUser, siteID int64) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}
	const size = 20
	where, args := `site_id = ?`, []any{siteID}
	if st := q.Get("status"); st != "" {
		if !leadStatuses[st] {
			writeError(w, http.StatusBadRequest, "bad_request", "无效的状态")
			return
		}
		where += ` AND status = ?`
		args = append(args, st)
	}
	var total int64
	if err := a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM leads WHERE `+where, args...).Scan(&total); err != nil {
		internalError(w)
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `SELECT `+leadCols+` FROM leads WHERE `+where+` ORDER BY id DESC LIMIT ? OFFSET ?`,
		append(args, size, (page-1)*size)...)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	writeJSON(w, http.StatusOK, map[string]any{"leads": scanLeads(rows), "total": total, "page": page, "pageSize": size})
}

func (a *App) updateLead(w http.ResponseWriter, r *http.Request, _ *authedUser, siteID int64) {
	leadID, ok := pathID(r, "leadId")
	var req struct {
		Status *string `json:"status"`
		Note   *string `json:"note"`
	}
	if !ok {
		writeError(w, http.StatusNotFound, "not_found", "线索不存在")
		return
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	if req.Status != nil && !leadStatuses[*req.Status] {
		writeError(w, http.StatusBadRequest, "bad_request", "无效的状态")
		return
	}
	if req.Status == nil && req.Note == nil {
		writeError(w, http.StatusBadRequest, "bad_request", "没有要修改的内容")
		return
	}
	sets, args := []string{"updated_at = ?"}, []any{time.Now().UTC()}
	if req.Status != nil {
		sets, args = append(sets, "status = ?"), append(args, *req.Status)
	}
	if req.Note != nil {
		sets, args = append(sets, "note = ?"), append(args, clip(*req.Note, 1000))
	}
	// site_id 条件保证只能改本站点的线索
	var n int
	res, err := a.db.ExecContext(r.Context(), `UPDATE leads SET `+strings.Join(sets, ", ")+` WHERE id = ? AND site_id = ?`, append(args, leadID, siteID)...)
	if err != nil {
		internalError(w)
		return
	}
	if c, _ := res.RowsAffected(); c == 0 {
		// MySQL 在值未变化时 RowsAffected 为 0，再确认一次线索是否存在
		a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM leads WHERE id = ? AND site_id = ?`, leadID, siteID).Scan(&n)
		if n == 0 {
			writeError(w, http.StatusNotFound, "not_found", "线索不存在")
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// exportLeads 导出全部线索为 CSV（UTF-8 带 BOM，Excel 直接打开不乱码）。
func (a *App) exportLeads(w http.ResponseWriter, r *http.Request, _ *authedUser, siteID int64) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT `+leadCols+` FROM leads WHERE site_id = ? ORDER BY id DESC LIMIT 50000`, siteID)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="leads.csv"`)
	w.Write([]byte("\xEF\xBB\xBF"))
	cw := csv.NewWriter(w)
	cw.Write([]string{"时间(北京)", "姓名", "手机", "邮箱", "公司", "留言", "来源页面", "状态", "备注"})
	for _, l := range scanLeads(rows) {
		cw.Write([]string{
			l["createdAt"].(time.Time).Add(cnOffset).Format("2006-01-02 15:04:05"),
			csvSafe(l["name"].(string)), csvSafe(l["phone"].(string)), csvSafe(l["email"].(string)),
			csvSafe(l["company"].(string)), csvSafe(l["message"].(string)), csvSafe(l["sourcePage"].(string)),
			l["status"].(string), csvSafe(l["note"].(string)),
		})
	}
	cw.Flush()
}

// csvSafe 防 CSV 公式注入：访客可控的文本以 = + - @ 开头时加前缀单引号。
func csvSafe(s string) string {
	if s != "" && strings.ContainsRune("=+-@\t\r", rune(s[0])) {
		return "'" + s
	}
	return s
}
