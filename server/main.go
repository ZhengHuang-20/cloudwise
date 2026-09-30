package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

type App struct {
	cfg          Config
	db           *sql.DB // 未配置 MySQL 时为 nil，AI 接口仍可用
	gemini       *Gemini // 未配置 key 时为 nil，走确定性 fallback
	loginLimiter *limiter
}

func (a *App) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"status":       "ok",
			"hasGeminiKey": a.gemini != nil,
			"hasDatabase":  a.db != nil,
			"timestamp":    time.Now().UTC().Format(time.RFC3339Nano),
		})
	})
	mux.HandleFunc("POST /api/gemini/chat", a.handleChat)
	mux.HandleFunc("POST /api/gemini/visibility-test", a.handleVisibility)

	// 账号
	mux.HandleFunc("POST /api/auth/login", a.handleLogin)
	anyUser := authOpts{allowMustChange: true}
	mux.HandleFunc("GET /api/auth/me", a.authed(anyUser, a.handleMe))
	mux.HandleFunc("POST /api/auth/logout", a.authed(anyUser, a.handleLogout))
	mux.HandleFunc("POST /api/auth/change-password", a.authed(anyUser, a.handleChangePassword))

	// 客户视角
	mux.HandleFunc("GET /api/sites", a.authed(authOpts{}, a.mySites))

	// 管理员
	mux.HandleFunc("GET /api/admin/organizations", a.authed(adminOnly, a.adminListOrgs))
	mux.HandleFunc("POST /api/admin/organizations", a.authed(adminOnly, a.adminCreateOrg))
	mux.HandleFunc("GET /api/admin/users", a.authed(adminOnly, a.adminListUsers))
	mux.HandleFunc("POST /api/admin/users", a.authed(adminOnly, a.adminCreateUser))
	mux.HandleFunc("POST /api/admin/users/{id}/reset-password", a.authed(adminOnly, a.adminResetPassword))
	mux.HandleFunc("PATCH /api/admin/users/{id}", a.authed(adminOnly, a.adminSetDisabled))
	mux.HandleFunc("GET /api/admin/sites", a.authed(adminOnly, a.adminListSites))
	mux.HandleFunc("POST /api/admin/sites", a.authed(adminOnly, a.adminCreateSite))
	mux.HandleFunc("POST /api/admin/sites/{id}/members", a.authed(adminOnly, a.adminAddMember))
	mux.HandleFunc("DELETE /api/admin/sites/{id}/members/{userId}", a.authed(adminOnly, a.adminRemoveMember))

	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotFound, "not_found", "接口不存在")
	})

	// 生产模式托管 dist/ 并做 SPA 回退；目录不存在时只提供 API。
	if st, err := os.Stat(a.cfg.StaticDir); err == nil && st.IsDir() {
		mux.Handle("/", spaHandler(a.cfg.StaticDir))
	}
	return securityHeaders(mux)
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		if strings.HasPrefix(r.URL.Path, "/api/") {
			h.Set("Cache-Control", "no-store")
		}
		next.ServeHTTP(w, r)
	})
}

func spaHandler(dir string) http.Handler {
	files := http.FileServer(http.Dir(dir))
	index := filepath.Join(dir, "index.html")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := filepath.Join(dir, filepath.Clean("/"+r.URL.Path))
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			files.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, index)
	})
}

func (a *App) cleanupSessions(ctx context.Context) {
	t := time.NewTicker(time.Hour)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			a.db.ExecContext(ctx, `DELETE FROM sessions WHERE expires_at < ?`, time.Now().UTC())
		}
	}
}

// createAdmin 是命令行子命令：server create-admin <email>，打印一次性初始密码。
func createAdmin(cfg Config, email string) error {
	if cfg.MySQLDSN == "" {
		return errors.New("未配置 MySQL（MYSQL_DSN 或 MYSQL_DATABASE）")
	}
	email, err := normalizeEmail(email)
	if err != nil {
		return err
	}
	if err := migrate(cfg.MySQLDSN); err != nil {
		return err
	}
	db, err := openDB(cfg.MySQLDSN, false)
	if err != nil {
		return err
	}
	defer db.Close()
	a := &App{cfg: cfg, db: db}
	req, _ := http.NewRequest(http.MethodPost, "/", nil)
	_, pw, err := a.createUser(req, email, "管理员", "admin", nil, "")
	if isDuplicate(err) {
		return errors.New("该邮箱已存在")
	}
	if err != nil {
		return err
	}
	fmt.Printf("管理员已创建\n邮箱: %s\n初始密码: %s\n首次登录后会被要求修改密码。\n", email, pw)
	return nil
}

func main() {
	cfg := loadConfig()

	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "create-admin":
			if len(os.Args) < 3 {
				log.Fatal("用法: server create-admin <email>")
			}
			if err := createAdmin(cfg, os.Args[2]); err != nil {
				log.Fatal(err)
			}
			return
		case "migrate":
			if cfg.MySQLDSN == "" {
				log.Fatal("未配置 MySQL（MYSQL_DSN 或 MYSQL_DATABASE）")
			}
			if err := migrate(cfg.MySQLDSN); err != nil {
				log.Fatal(err)
			}
			return
		default:
			log.Fatalf("未知命令 %q，可用：create-admin、migrate", os.Args[1])
		}
	}

	app := &App{cfg: cfg, gemini: NewGemini(cfg.GeminiKey, cfg.GeminiModel), loginLimiter: newLimiter(10, time.Minute)}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if cfg.MySQLDSN != "" {
		if err := migrate(cfg.MySQLDSN); err != nil {
			log.Fatalf("数据库迁移失败: %v", err)
		}
		db, err := openDB(cfg.MySQLDSN, false)
		if err != nil {
			log.Fatalf("连接 MySQL 失败: %v", err)
		}
		defer db.Close()
		app.db = db
		go app.cleanupSessions(ctx)
	} else {
		log.Println("未配置 MySQL：账号与后台接口不可用，AI 接口照常提供")
	}
	if app.gemini == nil {
		log.Println("未配置 GEMINI_API_KEY：AI 接口使用确定性 fallback")
	}

	srv := &http.Server{
		Addr:              "0.0.0.0:" + cfg.Port,
		Handler:           app.routes(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      90 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(shutdown)
	}()
	log.Printf("云端智荐 API 运行于 http://0.0.0.0:%s（模型 %s，FDE 展示 %v）", cfg.Port, cfg.GeminiModel, cfg.ShowFDE)
	if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
