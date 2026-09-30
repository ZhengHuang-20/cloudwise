package main

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/argon2"
)

const (
	sessionCookie  = "cw_session"
	sessionTTL     = 7 * 24 * time.Hour
	maxFailedLogin = 5
	lockDuration   = 15 * time.Minute
	minPasswordLen = 10
)

// ---------- 密码 ----------

const (
	argonTime    = 3
	argonMemory  = 64 * 1024
	argonThreads = 2
	argonKeyLen  = 32
)

func hashPassword(pw string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	key := argon2.IDKey([]byte(pw), salt, argonTime, argonMemory, argonThreads, argonKeyLen)
	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, argonMemory, argonTime, argonThreads,
		base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(key)), nil
}

func verifyPassword(pw, encoded string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false
	}
	var v, m, t, p int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &v); err != nil {
		return false
	}
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &m, &t, &p); err != nil {
		return false
	}
	salt, err1 := base64.RawStdEncoding.DecodeString(parts[4])
	want, err2 := base64.RawStdEncoding.DecodeString(parts[5])
	if err1 != nil || err2 != nil || m <= 0 || t <= 0 || p <= 0 || p > 255 {
		return false
	}
	got := argon2.IDKey([]byte(pw), salt, uint32(t), uint32(m), uint8(p), uint32(len(want)))
	return subtle.ConstantTimeCompare(got, want) == 1
}

// 用户不存在时也做一次等价的哈希校验，避免通过响应时间枚举邮箱。
var dummyHash, _ = hashPassword("dummy-password-for-timing")

const pwAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

// randomPassword 生成 16 位、不含易混字符的初始密码。
func randomPassword() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	out := make([]byte, len(b))
	for i, c := range b {
		out[i] = pwAlphabet[int(c)%len(pwAlphabet)]
	}
	return string(out), nil
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

func sha256Hex(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:])
}

func normalizeEmail(s string) (string, error) {
	s = strings.ToLower(strings.TrimSpace(s))
	addr, err := mail.ParseAddress(s)
	if err != nil || addr.Address != s || len(s) > 191 {
		return "", errors.New("邮箱格式不正确")
	}
	return s, nil
}

// ---------- 登录限流（按 IP，内存实现，单进程足够） ----------

type limiter struct {
	mu     sync.Mutex
	hits   map[string][]time.Time
	max    int
	window time.Duration
}

func newLimiter(max int, window time.Duration) *limiter {
	return &limiter{hits: map[string][]time.Time{}, max: max, window: window}
}

func (l *limiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	cut := now.Add(-l.window)
	kept := l.hits[key][:0]
	for _, t := range l.hits[key] {
		if t.After(cut) {
			kept = append(kept, t)
		}
	}
	if len(kept) >= l.max {
		l.hits[key] = kept
		return false
	}
	l.hits[key] = append(kept, now)
	if len(l.hits) > 10000 { // 防止内存无限增长
		for k, v := range l.hits {
			if len(v) == 0 || v[len(v)-1].Before(cut) {
				delete(l.hits, k)
			}
		}
	}
	return true
}

// ---------- 会话与中间件 ----------

type authedUser struct {
	ID         int64
	Email      string
	Role       string
	Name       string
	OrgID      sql.NullInt64
	MustChange bool
	CSRF       string
	SessionID  string
}

func (u *authedUser) json() map[string]any {
	m := map[string]any{
		"id": u.ID, "email": u.Email, "role": u.Role, "displayName": u.Name,
		"mustChangePassword": u.MustChange, "csrfToken": u.CSRF,
	}
	if u.OrgID.Valid {
		m["orgId"] = u.OrgID.Int64
	}
	return m
}

func (a *App) setSessionCookie(w http.ResponseWriter, r *http.Request, token string, expires time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name: sessionCookie, Value: token, Path: "/", Expires: expires,
		HttpOnly: true, Secure: a.isSecure(r), SameSite: http.SameSiteLaxMode,
	})
}

func (a *App) createSession(ctx context.Context, w http.ResponseWriter, r *http.Request, userID int64) (csrf string, err error) {
	token := randomHex(32)
	csrf = randomHex(32)
	now := time.Now().UTC()
	exp := now.Add(sessionTTL)
	ua := r.UserAgent()
	if len(ua) > 255 {
		ua = ua[:255]
	}
	_, err = a.db.ExecContext(ctx, `INSERT INTO sessions (id, user_id, csrf_token, ip, user_agent, created_at, expires_at) VALUES (?,?,?,?,?,?,?)`,
		sha256Hex(token), userID, csrf, a.clientIP(r), ua, now, exp)
	if err != nil {
		return "", err
	}
	a.setSessionCookie(w, r, token, exp)
	return csrf, nil
}

func (a *App) loadUser(r *http.Request) (*authedUser, error) {
	c, err := r.Cookie(sessionCookie)
	if err != nil || c.Value == "" {
		return nil, sql.ErrNoRows
	}
	sid := sha256Hex(c.Value)
	u := &authedUser{SessionID: sid}
	var must int
	err = a.db.QueryRowContext(r.Context(), `
		SELECT u.id, u.email, u.role, u.org_id, u.display_name, u.must_change_password, s.csrf_token
		FROM sessions s JOIN users u ON u.id = s.user_id
		WHERE s.id = ? AND s.expires_at > ? AND u.disabled = 0`, sid, time.Now().UTC()).
		Scan(&u.ID, &u.Email, &u.Role, &u.OrgID, &u.Name, &must, &u.CSRF)
	if err != nil {
		return nil, err
	}
	u.MustChange = must == 1
	return u, nil
}

type authOpts struct {
	role            string // 为空表示任意已登录用户
	allowMustChange bool   // 首次登录未改密时是否仍放行
}

// authed 包装需要登录的处理函数：校验会话、角色、CSRF，并在未改密时拦截业务接口。
func (a *App) authed(opts authOpts, h func(w http.ResponseWriter, r *http.Request, u *authedUser)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if a.db == nil {
			writeError(w, http.StatusServiceUnavailable, "db_unavailable", "数据库未配置")
			return
		}
		u, err := a.loadUser(r)
		if err != nil {
			if !errors.Is(err, sql.ErrNoRows) {
				writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
				return
			}
			writeError(w, http.StatusUnauthorized, "unauthorized", "请先登录")
			return
		}
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			if subtle.ConstantTimeCompare([]byte(r.Header.Get("X-CSRF-Token")), []byte(u.CSRF)) != 1 {
				writeError(w, http.StatusForbidden, "csrf", "请求校验失败，请刷新页面后重试")
				return
			}
		}
		if u.MustChange && !opts.allowMustChange {
			writeError(w, http.StatusForbidden, "password_change_required", "请先修改初始密码")
			return
		}
		if opts.role != "" && u.Role != opts.role {
			writeError(w, http.StatusForbidden, "forbidden", "没有权限")
			return
		}
		h(w, r, u)
	}
}

// ---------- 处理函数 ----------

func (a *App) handleLogin(w http.ResponseWriter, r *http.Request) {
	if a.db == nil {
		writeError(w, http.StatusServiceUnavailable, "db_unavailable", "数据库未配置")
		return
	}
	if !a.loginLimiter.allow(a.clientIP(r)) {
		writeError(w, http.StatusTooManyRequests, "rate_limited", "请求过于频繁，请稍后再试")
		return
	}
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	const badCreds = "邮箱或密码错误"
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" || req.Password == "" || len(req.Password) > 256 {
		writeError(w, http.StatusUnauthorized, "bad_credentials", badCreds)
		return
	}

	var (
		id       int64
		hash     string
		disabled int
		locked   sql.NullTime
	)
	err := a.db.QueryRowContext(r.Context(), `SELECT id, password_hash, disabled, locked_until FROM users WHERE email = ?`, email).
		Scan(&id, &hash, &disabled, &locked)
	if errors.Is(err, sql.ErrNoRows) {
		verifyPassword(req.Password, dummyHash)
		writeError(w, http.StatusUnauthorized, "bad_credentials", badCreds)
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	now := time.Now().UTC()
	if locked.Valid && locked.Time.After(now) {
		writeError(w, http.StatusTooManyRequests, "locked", "尝试次数过多，请 15 分钟后再试")
		return
	}
	if !verifyPassword(req.Password, hash) || disabled == 1 {
		// MySQL 的 UPDATE 按从左到右赋值，locked_until 必须写在 failed_logins 之前才能读到旧值。
		a.db.ExecContext(r.Context(), `UPDATE users
			SET locked_until = IF(failed_logins + 1 >= ?, ?, locked_until),
			    failed_logins = IF(failed_logins + 1 >= ?, 0, failed_logins + 1)
			WHERE id = ?`, maxFailedLogin, now.Add(lockDuration), maxFailedLogin, id)
		writeError(w, http.StatusUnauthorized, "bad_credentials", badCreds)
		return
	}

	if _, err := a.db.ExecContext(r.Context(), `UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = ? WHERE id = ?`, now, id); err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	csrf, err := a.createSession(r.Context(), w, r, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	u := &authedUser{}
	var must int
	err = a.db.QueryRowContext(r.Context(), `SELECT id, email, role, org_id, display_name, must_change_password FROM users WHERE id = ?`, id).
		Scan(&u.ID, &u.Email, &u.Role, &u.OrgID, &u.Name, &must)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	u.MustChange, u.CSRF = must == 1, csrf
	writeJSON(w, http.StatusOK, map[string]any{"user": u.json()})
}

func (a *App) handleMe(w http.ResponseWriter, r *http.Request, u *authedUser) {
	writeJSON(w, http.StatusOK, map[string]any{"user": u.json()})
}

func (a *App) handleLogout(w http.ResponseWriter, r *http.Request, u *authedUser) {
	a.db.ExecContext(r.Context(), `DELETE FROM sessions WHERE id = ?`, u.SessionID)
	a.setSessionCookie(w, r, "", time.Unix(0, 0))
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func validatePassword(pw, email string) string {
	switch {
	case len([]rune(pw)) < minPasswordLen:
		return fmt.Sprintf("新密码至少 %d 位", minPasswordLen)
	case len(pw) > 256:
		return "新密码过长"
	case strings.EqualFold(pw, email):
		return "新密码不能与邮箱相同"
	}
	return ""
}

func (a *App) handleChangePassword(w http.ResponseWriter, r *http.Request, u *authedUser) {
	var req struct {
		Current string `json:"currentPassword"`
		New     string `json:"newPassword"`
	}
	if !decodeJSON(w, r, &req) {
		return
	}
	var hash string
	if err := a.db.QueryRowContext(r.Context(), `SELECT password_hash FROM users WHERE id = ?`, u.ID).Scan(&hash); err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	if !verifyPassword(req.Current, hash) {
		writeError(w, http.StatusBadRequest, "bad_current_password", "当前密码不正确")
		return
	}
	if msg := validatePassword(req.New, u.Email); msg != "" {
		writeError(w, http.StatusBadRequest, "weak_password", msg)
		return
	}
	if req.New == req.Current {
		writeError(w, http.StatusBadRequest, "weak_password", "新密码不能与当前密码相同")
		return
	}
	newHash, err := hashPassword(req.New)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(r.Context(), `UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?`, newHash, u.ID); err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	// 改密后踢掉其他设备上的会话，保留当前会话。
	if _, err := tx.ExecContext(r.Context(), `DELETE FROM sessions WHERE user_id = ? AND id <> ?`, u.ID, u.SessionID); err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	if err := tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal", "服务器内部错误")
		return
	}
	u.MustChange = false
	writeJSON(w, http.StatusOK, map[string]any{"user": u.json()})
}
