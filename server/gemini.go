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
	client *http.Client
}

func NewGemini(key, model string) *Gemini {
	if key == "" {
		return nil
	}
	return &Gemini{key: key, model: model, client: &http.Client{Timeout: 60 * time.Second}}
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
	buf, _ := json.Marshal(body)
	text, status, err := g.call(ctx, buf)
	// 模型偶发 429/503（高峰限流），短暂等待后重试一次。
	if status == http.StatusTooManyRequests || status == http.StatusServiceUnavailable {
		select {
		case <-time.After(1500 * time.Millisecond):
			text, _, err = g.call(ctx, buf)
		case <-ctx.Done():
		}
	}
	return text, err
}

func (g *Gemini) call(ctx context.Context, buf []byte) (string, int, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", g.model)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return "", 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", g.key)

	resp, err := g.client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if resp.StatusCode != http.StatusOK {
		msg := string(raw)
		if len(msg) > 300 {
			msg = msg[:300]
		}
		return "", resp.StatusCode, fmt.Errorf("gemini http %d: %s", resp.StatusCode, msg)
	}
	var out struct {
		Candidates []struct {
			Content struct {
				Parts []gPart `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return "", 0, err
	}
	if len(out.Candidates) == 0 {
		return "", resp.StatusCode, errors.New("gemini: empty candidates")
	}
	var sb strings.Builder
	for _, p := range out.Candidates[0].Content.Parts {
		if !p.Thought {
			sb.WriteString(p.Text)
		}
	}
	return sb.String(), resp.StatusCode, nil
}
