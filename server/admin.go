package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

var adminOnly = authOpts{role: "admin"}

func isDuplicate(err error) bool {
	var me *mysql.MySQLError
	return errors.As(err, &me) && me.Number == 1062
}

func isFKViolation(err error) bool {
	var me *mysql.MySQLError
	return errors.As(err, &me) && (me.Number == 1452 || me.Number == 1451)
}

func internalError(w http.ResponseWriter) {
	writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
}

// ---------- 客户公司 ----------

func (a *App) adminListOrgs(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT id, name, created_at FROM organizations ORDER BY id DESC`)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var name string
		var created time.Time
		if rows.Scan(&id, &name, &created) == nil {
			out = append(out, map[string]any{"id": id, "name": name, "createdAt": created})
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"organizations": out})
}

func (a *App) adminCreateOrg(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	var req struct {
		Name string `json:"name"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	name := strings.TrimSpace(req.Name)
	if name == "" || len([]rune(name)) > 128 {
		writeError(w, http.StatusBadRequest, "bad_request", "公司名称不能为空且不超过 128 字")
		return
	}
	now := time.Now().UTC()
	res, err := a.db.ExecContext(r.Context(), `INSERT INTO organizations (name, created_at) VALUES (?, ?)`, name, now)
	if err != nil {
		internalError(w)
		return
	}
	id, _ := res.LastInsertId()
	writeJSON(w, http.StatusCreated, map[string]any{"organization": map[string]any{"id": id, "name": name, "createdAt": now}})
}

// ---------- 账号 ----------

func (a *App) adminListUsers(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT id, email, role, org_id, display_name, must_change_password, disabled, last_login_at, created_at
		FROM users ORDER BY id DESC`)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var (
			id          int64
			email, role string
			org         sql.NullInt64
			name        string
			must, dis   int
			lastLogin   sql.NullTime
			created     time.Time
		)
		if rows.Scan(&id, &email, &role, &org, &name, &must, &dis, &lastLogin, &created) != nil {
			continue
		}
		m := map[string]any{"id": id, "email": email, "role": role, "displayName": name,
			"mustChangePassword": must == 1, "disabled": dis == 1, "createdAt": created}
		if org.Valid {
			m["orgId"] = org.Int64
		}
		if lastLogin.Valid {
			m["lastLoginAt"] = lastLogin.Time
		}
		out = append(out, m)
	}
	writeJSON(w, http.StatusOK, map[string]any{"users": out})
}

// createUser 写入账号并返回一次性展示的初始密码。
func (a *App) createUser(ctx context.Context, email, name, role string, orgID *int64, password string) (int64, string, error) {
	if password == "" {
		p, err := randomPassword()
		if err != nil {
			return 0, "", err
		}
		password = p
	}
	hash, err := hashPassword(password)
	if err != nil {
		return 0, "", err
	}
	var org any
	if orgID != nil {
		org = *orgID
	}
	res, err := a.db.ExecContext(ctx, `INSERT INTO users (email, password_hash, role, org_id, display_name, must_change_password, created_at)
		VALUES (?, ?, ?, ?, ?, 1, ?)`, email, hash, role, org, name, time.Now().UTC())
	if err != nil {
		return 0, "", err
	}
	id, _ := res.LastInsertId()
	return id, password, nil
}

func (a *App) adminCreateUser(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	var req struct {
		Email       string `json:"email"`
		DisplayName string `json:"displayName"`
		Role        string `json:"role"`
		OrgID       *int64 `json:"orgId"`
		Password    string `json:"password"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	email, err := normalizeEmail(req.Email)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	role := req.Role
	if role == "" {
		role = "customer"
	}
	if role != "customer" && role != "admin" {
		writeError(w, http.StatusBadRequest, "bad_request", "角色只能是 customer 或 admin")
		return
	}
	if role == "customer" && req.OrgID == nil {
		writeError(w, http.StatusBadRequest, "bad_request", "客户账号必须指定所属公司 orgId")
		return
	}
	if req.Password != "" {
		if msg := validatePassword(req.Password, email); msg != "" {
			writeError(w, http.StatusBadRequest, "weak_password", strings.Replace(msg, "新密码", "初始密码", 1))
			return
		}
	}
	name := strings.TrimSpace(req.DisplayName)
	if len([]rune(name)) > 64 {
		writeError(w, http.StatusBadRequest, "bad_request", "姓名不超过 64 字")
		return
	}
	id, pw, err := a.createUser(r.Context(), email, name, role, req.OrgID, req.Password)
	switch {
	case isDuplicate(err):
		writeError(w, http.StatusConflict, "duplicate", "该邮箱已存在")
		return
	case isFKViolation(err):
		writeError(w, http.StatusBadRequest, "bad_request", "所属公司不存在")
		return
	case err != nil:
		internalError(w)
		return
	}
	// 初始密码只在创建响应里出现一次，库里只存哈希。
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "email": email, "initialPassword": pw})
}

func pathID(r *http.Request, name string) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	return id, err == nil && id > 0
}

func (a *App) adminResetPassword(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "bad_request", "无效的用户 ID")
		return
	}
	pw, err := randomPassword()
	if err != nil {
		internalError(w)
		return
	}
	hash, err := hashPassword(pw)
	if err != nil {
		internalError(w)
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		internalError(w)
		return
	}
	defer tx.Rollback()
	res, err := tx.ExecContext(r.Context(), `UPDATE users SET password_hash = ?, must_change_password = 1, failed_logins = 0, locked_until = NULL WHERE id = ?`, hash, id)
	if err != nil {
		internalError(w)
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		var exists int
		if tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM users WHERE id = ?`, id).Scan(&exists); exists == 0 {
			writeError(w, http.StatusNotFound, "not_found", "用户不存在")
			return
		}
	}
	if _, err := tx.ExecContext(r.Context(), `DELETE FROM sessions WHERE user_id = ?`, id); err != nil {
		internalError(w)
		return
	}
	if err := tx.Commit(); err != nil {
		internalError(w)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "initialPassword": pw})
}

func (a *App) adminSetDisabled(w http.ResponseWriter, r *http.Request, me *authedUser) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "bad_request", "无效的用户 ID")
		return
	}
	var req struct {
		Disabled *bool `json:"disabled"`
	}
	if !decodeJSON(w, r, &req) || req.Disabled == nil {
		if req.Disabled == nil {
			writeError(w, http.StatusBadRequest, "bad_request", "缺少 disabled 字段")
		}
		return
	}
	if id == me.ID && *req.Disabled {
		writeError(w, http.StatusBadRequest, "bad_request", "不能停用自己的账号")
		return
	}
	v := 0
	if *req.Disabled {
		v = 1
	}
	if _, err := a.db.ExecContext(r.Context(), `UPDATE users SET disabled = ? WHERE id = ?`, v, id); err != nil {
		internalError(w)
		return
	}
	if *req.Disabled {
		a.db.ExecContext(r.Context(), `DELETE FROM sessions WHERE user_id = ?`, id)
	}
	writeJSON(w, http.StatusOK, map[string]any{"id": id, "disabled": *req.Disabled})
}

// ---------- 站点 ----------

var domainRe = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$`)

// normalizeDomain 去掉协议、路径与端口，只保留小写主机名。
func normalizeDomain(s string) (string, bool) {
	s = strings.ToLower(strings.TrimSpace(s))
	s = strings.TrimPrefix(strings.TrimPrefix(s, "https://"), "http://")
	if i := strings.IndexAny(s, "/?#"); i >= 0 {
		s = s[:i]
	}
	if i := strings.LastIndex(s, ":"); i >= 0 {
		s = s[:i]
	}
	if len(s) > 255 || !domainRe.MatchString(s) {
		return "", false
	}
	return s, true
}

const siteCols = `s.id, s.org_id, s.name, s.domain, s.hosting, s.site_key, s.created_at`

func scanSites(rows *sql.Rows) []map[string]any {
	out := []map[string]any{}
	for rows.Next() {
		var id, org int64
		var name, domain, hosting, key string
		var created time.Time
		if rows.Scan(&id, &org, &name, &domain, &hosting, &key, &created) == nil {
			out = append(out, map[string]any{"id": id, "orgId": org, "name": name, "domain": domain,
				"hosting": hosting, "siteKey": key, "createdAt": created})
		}
	}
	return out
}

func (a *App) adminListSites(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	rows, err := a.db.QueryContext(r.Context(), `SELECT `+siteCols+` FROM sites s ORDER BY s.id DESC`)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	writeJSON(w, http.StatusOK, map[string]any{"sites": scanSites(rows)})
}

func (a *App) adminCreateSite(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	var req struct {
		OrgID   int64  `json:"orgId"`
		Name    string `json:"name"`
		Domain  string `json:"domain"`
		Hosting string `json:"hosting"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	domain, ok := normalizeDomain(req.Domain)
	name := strings.TrimSpace(req.Name)
	hosting := req.Hosting
	if hosting == "" {
		hosting = "script"
	}
	switch {
	case req.OrgID <= 0:
		writeError(w, http.StatusBadRequest, "bad_request", "请指定所属公司 orgId")
		return
	case name == "" || len([]rune(name)) > 128:
		writeError(w, http.StatusBadRequest, "bad_request", "站点名称不能为空且不超过 128 字")
		return
	case !ok:
		writeError(w, http.StatusBadRequest, "bad_request", "域名格式不正确，例如 www.example.com")
		return
	case hosting != "vercel" && hosting != "script" && hosting != "self_hosted":
		writeError(w, http.StatusBadRequest, "bad_request", "hosting 只能是 vercel / script / self_hosted")
		return
	}
	key := "sk_" + randomHex(12)
	now := time.Now().UTC()
	res, err := a.db.ExecContext(r.Context(), `INSERT INTO sites (org_id, name, domain, hosting, site_key, created_at) VALUES (?,?,?,?,?,?)`,
		req.OrgID, name, domain, hosting, key, now)
	switch {
	case isDuplicate(err):
		writeError(w, http.StatusConflict, "duplicate", "该域名已接入")
		return
	case isFKViolation(err):
		writeError(w, http.StatusBadRequest, "bad_request", "所属公司不存在")
		return
	case err != nil:
		internalError(w)
		return
	}
	id, _ := res.LastInsertId()
	writeJSON(w, http.StatusCreated, map[string]any{"site": map[string]any{"id": id, "orgId": req.OrgID, "name": name,
		"domain": domain, "hosting": hosting, "siteKey": key, "createdAt": now}})
}

func (a *App) adminAddMember(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	siteID, ok := pathID(r, "id")
	var req struct {
		UserID int64 `json:"userId"`
	}
	if !ok || !decodeJSON(w, r, &req) {
		if !ok {
			writeError(w, http.StatusBadRequest, "bad_request", "无效的站点 ID")
		}
		return
	}
	// 只允许把站点授权给同一公司的客户账号，避免串户。
	var match int
	err := a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM sites s JOIN users u ON u.org_id = s.org_id
		WHERE s.id = ? AND u.id = ? AND u.role = 'customer'`, siteID, req.UserID).Scan(&match)
	if err != nil {
		internalError(w)
		return
	}
	if match == 0 {
		writeError(w, http.StatusBadRequest, "bad_request", "站点或用户不存在，或用户不属于该站点所在公司")
		return
	}
	if _, err := a.db.ExecContext(r.Context(), `INSERT IGNORE INTO site_members (site_id, user_id, created_at) VALUES (?,?,?)`,
		siteID, req.UserID, time.Now().UTC()); err != nil {
		internalError(w)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) adminRemoveMember(w http.ResponseWriter, r *http.Request, _ *authedUser) {
	siteID, ok1 := pathID(r, "id")
	userID, ok2 := pathID(r, "userId")
	if !ok1 || !ok2 {
		writeError(w, http.StatusBadRequest, "bad_request", "无效的 ID")
		return
	}
	if _, err := a.db.ExecContext(r.Context(), `DELETE FROM site_members WHERE site_id = ? AND user_id = ?`, siteID, userID); err != nil {
		internalError(w)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// mySites 是客户视角的站点列表：管理员看全部，客户只看授权给自己的。
func (a *App) mySites(w http.ResponseWriter, r *http.Request, u *authedUser) {
	q := `SELECT ` + siteCols + ` FROM sites s JOIN site_members m ON m.site_id = s.id WHERE m.user_id = ? ORDER BY s.id DESC`
	args := []any{u.ID}
	if u.Role == "admin" {
		q, args = `SELECT `+siteCols+` FROM sites s ORDER BY s.id DESC`, nil
	}
	rows, err := a.db.QueryContext(r.Context(), q, args...)
	if err != nil {
		internalError(w)
		return
	}
	defer rows.Close()
	writeJSON(w, http.StatusOK, map[string]any{"sites": scanSites(rows)})
}
