package main

import (
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"

	"github.com/go-sql-driver/mysql"
)

// Config 汇总所有环境变量。缺省值保证「不配 key、不配数据库」也能启动。
type Config struct {
	ListenHost   string
	Port         string
	GeminiKey    string
	GeminiModel  string
	MySQLDSN     string // 为空表示未配置数据库
	StaticDir    string
	CookieSecure bool
	TrustProxy   bool
	ShowFDE      bool
}

var envKeyRe = regexp.MustCompile(`^[A-Z][A-Z0-9_]*$`)

// parseEnv 解析 KEY=VALUE 行。stripQuotes 用于手写的 .env；部署传入的内容原样保留。
func parseEnv(data string, stripQuotes bool) map[string]string {
	out := map[string]string{}
	for _, line := range strings.Split(data, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		k = strings.TrimSpace(k)
		if !ok || !envKeyRe.MatchString(k) {
			continue
		}
		v = strings.TrimSpace(v)
		if stripQuotes {
			v = strings.Trim(v, `"'`)
		}
		out[k] = v
	}
	return out
}

func setIfUnset(vars map[string]string) {
	for k, v := range vars {
		if _, exists := os.LookupEnv(k); !exists {
			os.Setenv(k, v)
		}
	}
}

// loadDotEnv 读取 .env（不覆盖已存在的环境变量）。
func loadDotEnv(path string) {
	if b, err := os.ReadFile(path); err == nil {
		setIfUnset(parseEnv(string(b), true))
	}
}

// 部署传入的密钥：GitHub Actions 把 Secrets 编码成 hex，拼在 SSH 命令里（deploy CW_ENV=<hex>），
// 服务器上的 deploy 脚本会把 SSH_ORIGINAL_COMMAND 继承给 docker compose，compose 再原样交给容器
// 的 CW_DEPLOY_ENV。只接受下列前缀的变量，避免被用来改写 PATH 之类的进程环境。
var (
	deployEnvRe        = regexp.MustCompile(`CW_ENV=([0-9a-fA-F]+)`)
	deployEnvPrefixes  = []string{"GEMINI_", "MYSQL_", "CW_ADMIN_", "COOKIE_", "TRUST_", "SHOW_FDE"}
	ephemeralEnvPrefix = []string{"MYSQL_ADMIN_", "CW_ADMIN_"} // 只在本次启动生效，不落盘
)

func hasAnyPrefix(k string, prefixes []string) bool {
	for _, p := range prefixes {
		if strings.HasPrefix(k, p) {
			return true
		}
	}
	return false
}

// loadDeployEnv 读取部署传入的密钥并持久化到卷里（/state/env），
// 这样手动重启或不带密钥的重新部署也能继续使用上一次的配置。
func loadDeployEnv() {
	statePath := env("CW_STATE_FILE", "/state/env")
	if raw := os.Getenv("CW_DEPLOY_ENV"); raw != "" {
		if m := deployEnvRe.FindStringSubmatch(raw); m != nil {
			if b, err := hex.DecodeString(m[1]); err == nil && len(b) > 0 {
				vars := map[string]string{}
				var persist strings.Builder
				for k, v := range parseEnv(string(b), false) {
					if !hasAnyPrefix(k, deployEnvPrefixes) {
						continue
					}
					vars[k] = v
					if !hasAnyPrefix(k, ephemeralEnvPrefix) {
						fmt.Fprintf(&persist, "%s=%s\n", k, v)
					}
				}
				if err := os.WriteFile(statePath, []byte(persist.String()), 0o600); err != nil {
					log.Printf("无法写入 %s（重启后将丢失部署密钥）: %v", statePath, err)
				}
				setIfUnset(vars)
			}
		}
		os.Unsetenv("CW_DEPLOY_ENV")
	}
	if b, err := os.ReadFile(statePath); err == nil {
		setIfUnset(parseEnv(string(b), false))
	}
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

var showFDERe = regexp.MustCompile(`export const SHOW_FDE\s*=\s*(true|false)`)

// resolveShowFDE：环境变量 SHOW_FDE 优先，其次读取前端 src/lib/features.ts（单一事实来源），默认 true。
func resolveShowFDE() bool {
	if v := os.Getenv("SHOW_FDE"); v != "" {
		return v == "true" || v == "1"
	}
	for _, p := range []string{"../src/lib/features.ts", "src/lib/features.ts"} {
		if b, err := os.ReadFile(p); err == nil {
			if m := showFDERe.FindSubmatch(b); m != nil {
				return string(m[1]) == "true"
			}
		}
	}
	return true
}

func mysqlDSN() string {
	if dsn := os.Getenv("MYSQL_DSN"); dsn != "" {
		return dsn
	}
	dbName := os.Getenv("MYSQL_DATABASE")
	if dbName == "" {
		return ""
	}
	c := mysql.NewConfig()
	c.User = env("MYSQL_USER", "root")
	c.Passwd = os.Getenv("MYSQL_PASSWORD")
	c.Net = "tcp"
	c.Addr = fmt.Sprintf("%s:%s", env("MYSQL_HOST", "127.0.0.1"), env("MYSQL_PORT", "3306"))
	c.DBName = dbName
	c.Collation = "utf8mb4_0900_ai_ci"
	return c.FormatDSN()
}

func loadConfig() Config {
	loadDeployEnv()
	loadDotEnv(".env")
	loadDotEnv("../.env")
	key := os.Getenv("GEMINI_API_KEY")
	if key == "MY_GEMINI_API_KEY" {
		key = ""
	}
	return Config{
		ListenHost:   env("LISTEN_HOST", "0.0.0.0"),
		Port:         env("PORT", "8080"),
		GeminiKey:    key,
		GeminiModel:  env("GEMINI_MODEL", "gemini-3.1-flash-lite"),
		MySQLDSN:     mysqlDSN(),
		StaticDir:    env("STATIC_DIR", "../dist"),
		CookieSecure: os.Getenv("COOKIE_SECURE") == "true",
		TrustProxy:   os.Getenv("TRUST_PROXY") == "true",
		ShowFDE:      resolveShowFDE(),
	}
}
