package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

// configError 是配置校验失败（文案固定、不含敏感信息），会原样出现在 /api/health 的 dbIssue 里。
type configError string

func (e configError) Error() string { return string(e) }

var (
	identRe  = regexp.MustCompile(`^[A-Za-z0-9_]{1,32}$`)
	appPwdRe = regexp.MustCompile(`^[A-Za-z0-9_.@#%+=-]{12,128}$`) // 拼进 SQL 文本，所以不允许引号与反斜杠
)

// bootstrapDB 用管理员账号（MYSQL_ADMIN_USER/PASSWORD）幂等地建库、建应用专用账号并授权。
// 未提供管理员账号或使用完整 MYSQL_DSN 时直接跳过。
// 应用账号同时建在 localhost 与 127.0.0.1 两个 host 上，因为 TCP 回环连接的 host 匹配取决于 skip_name_resolve。
func bootstrapDB() error {
	adminUser := os.Getenv("MYSQL_ADMIN_USER")
	if adminUser == "" || os.Getenv("MYSQL_DSN") != "" {
		return nil
	}
	dbName := os.Getenv("MYSQL_DATABASE")
	appUser := env("MYSQL_USER", "root")
	appPwd := os.Getenv("MYSQL_PASSWORD")
	switch {
	case !identRe.MatchString(dbName):
		return configError("MYSQL_DATABASE 只能包含字母、数字和下划线")
	case !identRe.MatchString(appUser) || appUser == "root":
		return configError("MYSQL_USER 必须是专用账号（字母、数字、下划线，且不能是 root）")
	case !appPwdRe.MatchString(appPwd):
		return configError("MYSQL_PASSWORD 需为 12 位以上，且只含字母、数字和 _.@#%+=-")
	}

	c := mysql.NewConfig()
	c.User = adminUser
	c.Passwd = os.Getenv("MYSQL_ADMIN_PASSWORD")
	c.Net = "tcp"
	c.Addr = fmt.Sprintf("%s:%s", env("MYSQL_HOST", "127.0.0.1"), env("MYSQL_PORT", "3306"))
	c.Timeout = 5 * time.Second
	connector, err := mysql.NewConnector(c)
	if err != nil {
		return err
	}
	admin := sql.OpenDB(connector)
	defer admin.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if err := admin.PingContext(ctx); err != nil {
		return err
	}

	stmts := []string{fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4", dbName)}
	for _, host := range []string{"localhost", "127.0.0.1"} {
		acct := fmt.Sprintf("'%s'@'%s'", appUser, host)
		stmts = append(stmts,
			fmt.Sprintf("CREATE USER IF NOT EXISTS %s IDENTIFIED BY '%s'", acct, appPwd),
			fmt.Sprintf("ALTER USER %s IDENTIFIED BY '%s'", acct, appPwd), // 密钥轮换后同步
			fmt.Sprintf("GRANT ALL PRIVILEGES ON `%s`.* TO %s", dbName, acct),
		)
	}
	for _, q := range stmts {
		if _, err := admin.ExecContext(ctx, q); err != nil {
			return err
		}
	}
	log.Printf("数据库 %s 与专用账号 %s 已就绪", dbName, appUser)
	return nil
}

// seedAdmin 按 CW_ADMIN_EMAIL / CW_ADMIN_PASSWORD 创建首个管理员。只创建，从不修改已有账号；
// 首次登录仍会被要求改密。
func (a *App) seedAdmin(ctx context.Context) {
	emailRaw, pw := os.Getenv("CW_ADMIN_EMAIL"), os.Getenv("CW_ADMIN_PASSWORD")
	if emailRaw == "" || pw == "" {
		return
	}
	email, err := normalizeEmail(emailRaw)
	if err != nil {
		log.Printf("CW_ADMIN_EMAIL 无效，跳过创建管理员: %v", err)
		return
	}
	if msg := validatePassword(pw, email); msg != "" {
		log.Printf("CW_ADMIN_PASSWORD 不符合要求，跳过创建管理员: %s", strings.Replace(msg, "新密码", "初始密码", 1))
		return
	}
	var n int
	if err := a.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE email = ?`, email).Scan(&n); err != nil || n > 0 {
		return
	}
	if _, _, err := a.createUser(ctx, email, "管理员", "admin", nil, pw); err != nil {
		log.Printf("创建管理员失败: %v", err)
		return
	}
	log.Printf("已创建管理员 %s（首次登录需改密）", email)
}

// errSummary 只保留不含敏感信息的错误摘要，用于 /api/health 的排障字段。
func errSummary(err error) string {
	var ce configError
	if errors.As(err, &ce) {
		return string(ce)
	}
	var me *mysql.MySQLError
	if errors.As(err, &me) {
		return fmt.Sprintf("mysql error %d", me.Number)
	}
	return "无法连接或校验失败"
}
