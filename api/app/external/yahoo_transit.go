package external

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"time"
)

type TransitResp struct {
	SummaryInfo  SummaryInfo `json:"summaryInfo"`
	EdgeInfoList []EdgeInfo  `json:"edgeInfoList"`
}

func FetchRoutes(from string, to string, vias []string) ([]TransitResp, error) {
	html, err := fetchRoutesHTML(from, to, vias)
	if err != nil {
		return nil, err
	}

	jsonData, err := extractJSONData(html)
	if err != nil {
		return nil, err
	}

	return parseRoutes(jsonData)
}

func fetchRoutesHTML(from string, to string, vias []string) (string, error) {
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

	jst, _ := time.LoadLocation("Asia/Tokyo")
	now := time.Now().In(jst)
	q.Set("y", fmt.Sprintf("%04d", now.Year()))
	q.Set("m", fmt.Sprintf("%02d", int(now.Month())))
	q.Set("d", fmt.Sprintf("%02d", now.Day()))
	q.Set("hh", fmt.Sprintf("%02d", now.Hour()))
	q.Set("m1", fmt.Sprintf("%d", now.Minute()/10))
	q.Set("m2", fmt.Sprintf("%d", now.Minute()%10))
	q.Set("type", "1")
	q.Set("ticket", "ic")
	q.Set("expkind", "1")
	q.Set("userpass", "1")
	q.Set("ws", "3")
	q.Set("s", "0")
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

	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
	req.Header.Set("accept-language", "en-US,en;q=0.9,ja;q=0.8")
	req.Header.Set("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("通信エラー: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("レスポンス読み込みエラー: %w", err)
	}

	return string(body), nil
}

func extractJSONData(html string) (string, error) {
	re := regexp.MustCompile(`<script id="__NEXT_DATA__" type="application/json">(.*?)</script>`)
	matches := re.FindStringSubmatch(html)
	if len(matches) > 1 {
		return matches[1], nil
	}
	return "", fmt.Errorf("JSONデータが見つかりませんでした")
}

func parseRoutes(jsonData string) ([]TransitResp, error) {
	var data NextData
	err := json.Unmarshal([]byte(jsonData), &data)
	if err != nil {
		return nil, fmt.Errorf("JSONパースエラー: %w", err)
	}

	features := data.Props.PageProps.NaviSearchParam.FeatureInfoList

	for i := range features {
		var filteredEdges []EdgeInfo
		for _, edge := range features[i].EdgeInfoList {
			if edge.State == 2 || regexp.MustCompile(`乗換不要`).MatchString(edge.PointName) {
				continue
			}
			filteredEdges = append(filteredEdges, edge)
		}
		features[i].EdgeInfoList = filteredEdges
	}

	return features, nil
}

type NextData struct {
	Props struct {
		PageProps struct {
			NaviSearchParam struct {
				FeatureInfoList []TransitResp `json:"featureInfoList"`
			} `json:"naviSearchParam"`
		} `json:"pageProps"`
	} `json:"props"`
}

type SummaryInfo struct {
	DepartureTime string `json:"departureTime"`
	ArrivalTime   string `json:"arrivalTime"`
	TotalTime     string `json:"totalTime"`
	TotalPrice    string `json:"totalPrice"`
	TimeOnBoard   string `json:"timeOnBoard"`
	TransferCount string `json:"transferCount"`
	IsFast        bool   `json:"isFast"`
	IsEasy        bool   `json:"isEasy"`
	IsCheap       bool   `json:"isCheap"`
	Distance      string `json:"distance"`
}

type EdgeInfo struct {
	StationName                  string     `json:"stationName"`
	RailName                     string     `json:"railName"`
	RailNameExcludingDestination string     `json:"railNameExcludingDestination"`
	Destination                  string     `json:"destination"`
	State                        int        `json:"state"`
	PointName                    string     `json:"pointName"`
	TimeInfo                     []TimeInfo `json:"timeInfo"`
	PriceInfo                    PriceInfo  `json:"priceInfo"`
}

type TimeInfo struct {
	Time string `json:"time"`
	Type int    `json:"type"`
}

type PriceInfo struct {
	Price string `json:"price"`
}
