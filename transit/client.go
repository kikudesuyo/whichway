package transit

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

func FetchRoutesHTML(from string, to string, vias []string) (string, error) {
	baseURL, err := url.Parse("https://transit.yahoo.co.jp/search/result")
	if err != nil {
		return "", fmt.Errorf("URL解析エラー: %w", err)
	}

	q := baseURL.Query()
	q.Set("from", from)
	q.Set("to", to)

	for _, via := range vias {
		q.Add("via", via)
	}

	now := time.Now()
	q.Set("y", fmt.Sprintf("%04d", now.Year()))
	q.Set("m", fmt.Sprintf("%02d", int(now.Month())))
	q.Set("d", fmt.Sprintf("%02d", now.Day()))
	q.Set("hh", fmt.Sprintf("%02d", now.Hour()))
	q.Set("m1", fmt.Sprintf("%d", now.Minute()/10))
	q.Set("m2", fmt.Sprintf("%d", now.Minute()%10))
	q.Set("type", "1") // 出発時刻指定
	q.Set("ticket", "ic")
	q.Set("expkind", "1")
	q.Set("userpass", "1")
	q.Set("ws", "3")
	q.Set("s", "0") // 到着順
	q.Set("al", "1")
	q.Set("shin", "1")
	q.Set("ex", "1")
	q.Set("hb", "1")
	q.Set("lb", "1")
	q.Set("sr", "1")

	baseURL.RawQuery = q.Encode()
	reqURL := baseURL.String()

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return "", fmt.Errorf("リクエスト作成エラー: %w", err)
	}

	// 必須ヘッダー
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
	req.Header.Set("accept-language", "en-US,en;q=0.9,ja;q=0.8")
	req.Header.Set("cache-control", "max-age=0")
	req.Header.Set("sec-ch-ua", `"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"`)
	req.Header.Set("sec-ch-ua-mobile", "?1")
	req.Header.Set("sec-ch-ua-platform", `"iOS"`)
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("通信エラー: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("HTTPエラー: %s\n", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("レスポンス読み込みエラー: %w", err)
	}

	return string(body), nil
}
