package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// probeEngine 是 AI 可见性测评的一个探测平台：以普通用户身份提问（开启联网搜索），
// 返回回答原文与引用来源。品牌识别、问题生成与结果分析仍统一由 Gemini 完成。
type probeEngine interface {
	ID() string   // 稳定标识，写入报告与缓存签名
	Name() string // 页面展示名
	Ask(ctx context.Context, prompt string) (string, []WebSource, error)
}

// 展示顺序：ChatGPT → Perplexity → Gemini。
func (a *App) probeEngines() []probeEngine {
	var out []probeEngine
	if a.openai != nil {
		out = append(out, a.openai)
	}
	if a.perplexity != nil {
		out = append(out, a.perplexity)
	}
	if a.gemini != nil {
		out = append(out, geminiEngine{a.gemini})
	}
	return out
}

func engineSignature(engines []probeEngine) string {
	ids := make([]string, len(engines))
	for i, e := range engines {
		ids[i] = e.ID()
	}
	return strings.Join(ids, ",")
}

// hostOfURL 取链接的主机名（去掉 www.），用于展示来源与判断是否引用了官网。
func hostOfURL(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return ""
	}
	return strings.TrimPrefix(strings.ToLower(u.Hostname()), "www.")
}

// ---------- Gemini（Google 搜索 grounding） ----------

type geminiEngine struct{ g *Gemini }

func (geminiEngine) ID() string   { return "gemini" }
func (geminiEngine) Name() string { return "Gemini" }
func (e geminiEngine) Ask(ctx context.Context, prompt string) (string, []WebSource, error) {
	text, sources, err := e.g.AskWithSearch(ctx, prompt)
	// Gemini 的 URI 是 Google 的跳转链接，Title 才是来源域名。
	for i := range sources {
		sources[i].Domain = strings.TrimPrefix(strings.ToLower(sources[i].Title), "www.")
	}
	return text, sources, err
}

// ---------- 通用 HTTP 调用 ----------

// postJSON 发送 JSON 请求并解析响应；429/503 时等待后重试一次。
func postJSON(ctx context.Context, c *http.Client, endpoint, bearer string, body any, out any) error {
	buf, _ := json.Marshal(body)
	for attempt := 0; ; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(buf))
		if err != nil {
			return err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+bearer)
		resp, err := c.Do(req)
		if err != nil {
			return err
		}
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
		resp.Body.Close()
		if (resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode == http.StatusServiceUnavailable) && attempt == 0 {
			select {
			case <-time.After(2 * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}
		if resp.StatusCode != http.StatusOK {
			msg := string(raw)
			if len(msg) > 300 {
				msg = msg[:300]
			}
			return fmt.Errorf("http %d: %s", resp.StatusCode, msg)
		}
		return json.Unmarshal(raw, out)
	}
}

// ---------- OpenAI（Responses API + web_search 工具） ----------

type OpenAI struct {
	key, model, base string
	client           *http.Client
}

func NewOpenAI(key, model, base string) *OpenAI {
	if key == "" {
		return nil
	}
	return &OpenAI{key: key, model: model, base: strings.TrimRight(base, "/"), client: &http.Client{Timeout: 90 * time.Second}}
}

func (*OpenAI) ID() string   { return "openai" }
func (*OpenAI) Name() string { return "ChatGPT" }

func (o *OpenAI) Ask(ctx context.Context, prompt string) (string, []WebSource, error) {
	var out struct {
		Output []struct {
			Type    string `json:"type"`
			Content []struct {
				Type        string `json:"type"`
				Text        string `json:"text"`
				Annotations []struct {
					Type  string `json:"type"`
					URL   string `json:"url"`
					Title string `json:"title"`
				} `json:"annotations"`
			} `json:"content"`
		} `json:"output"`
	}
	body := map[string]any{
		"model": o.model,
		"input": prompt,
		"tools": []any{map[string]any{"type": "web_search"}},
	}
	if err := postJSON(ctx, o.client, o.base+"/v1/responses", o.key, body, &out); err != nil {
		return "", nil, fmt.Errorf("openai: %w", err)
	}
	var sb strings.Builder
	var sources []WebSource
	for _, item := range out.Output {
		if item.Type != "message" {
			continue
		}
		for _, c := range item.Content {
			if c.Type != "output_text" {
				continue
			}
			sb.WriteString(c.Text)
			for _, an := range c.Annotations {
				if an.Type == "url_citation" && an.URL != "" {
					sources = append(sources, WebSource{Title: an.Title, URI: an.URL, Domain: hostOfURL(an.URL)})
				}
			}
		}
	}
	if sb.Len() == 0 {
		return "", nil, errors.New("openai: empty answer")
	}
	return sb.String(), sources, nil
}

// ---------- Perplexity（Sonar，自带联网搜索） ----------

type Perplexity struct {
	key, model, base string
	client           *http.Client
}

func NewPerplexity(key, model, base string) *Perplexity {
	if key == "" {
		return nil
	}
	return &Perplexity{key: key, model: model, base: strings.TrimRight(base, "/"), client: &http.Client{Timeout: 90 * time.Second}}
}

func (*Perplexity) ID() string   { return "perplexity" }
func (*Perplexity) Name() string { return "Perplexity" }

func (p *Perplexity) Ask(ctx context.Context, prompt string) (string, []WebSource, error) {
	var out struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Citations     []string `json:"citations"`
		SearchResults []struct {
			Title string `json:"title"`
			URL   string `json:"url"`
		} `json:"search_results"`
	}
	body := map[string]any{
		"model":    p.model,
		"messages": []any{map[string]any{"role": "user", "content": prompt}},
	}
	if err := postJSON(ctx, p.client, p.base+"/chat/completions", p.key, body, &out); err != nil {
		return "", nil, fmt.Errorf("perplexity: %w", err)
	}
	if len(out.Choices) == 0 || strings.TrimSpace(out.Choices[0].Message.Content) == "" {
		return "", nil, errors.New("perplexity: empty answer")
	}
	var sources []WebSource
	if len(out.SearchResults) > 0 {
		for _, r := range out.SearchResults {
			sources = append(sources, WebSource{Title: r.Title, URI: r.URL, Domain: hostOfURL(r.URL)})
		}
	} else {
		for _, u := range out.Citations {
			sources = append(sources, WebSource{URI: u, Domain: hostOfURL(u)})
		}
	}
	return out.Choices[0].Message.Content, sources, nil
}
