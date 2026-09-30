package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/go-sql-driver/mysql"
)

// Config 汇总所有环境变量。缺省值保证「不配 key、不配数据库」也能启动。
type Config struct {
	Port         string
	GeminiKey    string
	GeminiModel  string
	MySQLDSN     string // 为空表示未配置数据库
	StaticDir    string
	CookieSecure bool
	TrustProxy   bool
	ShowFDE      bool
}

// loadDotEnv 读取 .env（不覆盖已存在的环境变量）。
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		v = strings.Trim(strings.TrimSpace(v), `"'`)
		if _, exists := os.LookupEnv(k); !exists {
			os.Setenv(k, v)
		}
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
	loadDotEnv(".env")
	loadDotEnv("../.env")
	key := os.Getenv("GEMINI_API_KEY")
	if key == "MY_GEMINI_API_KEY" {
		key = ""
	}
	return Config{
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
