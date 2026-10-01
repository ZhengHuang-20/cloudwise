package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Gemini 是对 Generative Language REST 接口的最小封装，key 只在服务端使用。
type Gemini struct {
	key    string
	model  string
	base   string // 接口地址，测试时可替换
	client *http.Client
}

func NewGemini(key, model string) *Gemini {
	if key == "" {
		return nil
	}
	return &Gemini{key: key, model: model, base: "https://generativelanguage.googleapis.com", client: &http.Client{Timeout: 60 * time.Second}}
}

type gPart struct {
	Text    string `json:"text"`
	Thought bool   `json:"thought,omitempty"`
}

// GenerateJSON 调用模型并要求返回 JSON，返回模型输出的原始文本。
func (g *Gemini) GenerateJSON(ctx context.Context, system, prompt string, temperature float64) (string, error) {
	body := map[string]any{
		"contents": []any{map[string]any{"role": "user", "parts": []gPart{{Text: prompt}}}},
		"generationConfig": map[string]any{
			"temperature":      temperature,
			"responseMimeType": "application/json",
		},
	}
	if system != "" {
		body["systemInstruction"] = map[string]any{"parts": []gPart{{Text: system}}}
	}
	res, err := g.generate(ctx, body)
	return res.text, err
}

// WebSource 是联网搜索回答引用的网页。Gemini 的 Title 是来源域名、URI 是 Google 的跳转链接；
// 其他平台的 URI 是原始链接。Domain 统一为来源域名（不含 www.），用于展示与判断是否引用了官网。
type WebSource struct {
	Title  string `json:"title"`
	URI    string `json:"uri"`
	Domain string `json:"domain"`
}

// AskWithSearch 以普通用户的方式提问，开启 Google 搜索 grounding，返回回答原文与引用来源。
// 用于 AI 可见性测评：模拟海外买家向 AI 搜索提问时看到的答案。
func (g *Gemini) AskWithSearch(ctx context.Context, prompt string) (string, []WebSource, error) {
	body := map[string]any{
		"contents": []any{map[string]any{"role": "user", "parts": []gPart{{Text: prompt}}}},
		"tools":    []any{map[string]any{"google_search": map[string]any{}}},
	}
	res, err := g.generate(ctx, body)
	return res.text, res.sources, err
}

type genResult struct {
	text    string
	sources []WebSource
}

func (g *Gemini) generate(ctx context.Context, body map[string]any) (genResult, error) {
	buf, _ := json.Marshal(body)
	res, status, err := g.call(ctx, buf)
	// 模型偶发 429/503（高峰限流），短暂等待后重试一次。
	if status == http.StatusTooManyRequests || status == http.StatusServiceUnavailable {
		select {
		case <-time.After(1500 * time.Millisecond):
			res, _, err = g.call(ctx, buf)
		case <-ctx.Done():
		}
	}
	return res, err
}

func (g *Gemini) call(ctx context.Context, buf []byte) (genResult, int, error) {
	url := fmt.Sprintf("%s/v1beta/models/%s:generateContent", g.base, g.model)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return genResult{}, 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", g.key)

	resp, err := g.client.Do(req)
	if err != nil {
		return genResult{}, 0, err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if resp.StatusCode != http.StatusOK {
		msg := string(raw)
		if len(msg) > 300 {
			msg = msg[:300]
		}
		return genResult{}, resp.StatusCode, fmt.Errorf("gemini http %d: %s", resp.StatusCode, msg)
	}
	var out struct {
		Candidates []struct {
			Content struct {
				Parts []gPart `json:"parts"`
			} `json:"content"`
			GroundingMetadata struct {
				GroundingChunks []struct {
					Web WebSource `json:"web"`
				} `json:"groundingChunks"`
			} `json:"groundingMetadata"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return genResult{}, 0, err
	}
	if len(out.Candidates) == 0 {
		return genResult{}, resp.StatusCode, errors.New("gemini: empty candidates")
	}
	c := out.Candidates[0]
	var sb strings.Builder
	for _, p := range c.Content.Parts {
		if !p.Thought {
			sb.WriteString(p.Text)
		}
	}
	res := genResult{text: sb.String()}
	for _, ch := range c.GroundingMetadata.GroundingChunks {
		if ch.Web.URI != "" || ch.Web.Title != "" {
			res.sources = append(res.sources, ch.Web)
		}
	}
	return res, resp.StatusCode, nil
}
