package transit

import (
	"encoding/json"
	"fmt"
	"regexp"
)

// HTMLからJSON部分を抽出する
func ExtractJSONData(html string) (string, error) {
	re := regexp.MustCompile(`<script id="__NEXT_DATA__" type="application/json">(.*?)</script>`)
	matches := re.FindStringSubmatch(html)
	if len(matches) > 1 {
		return matches[1], nil
	}
	return "", fmt.Errorf("JSONデータが見つかりませんでした")
}

// JSON文字列をパースしてFeatureInfoのリストを返す
func ParseRoutes(jsonData string) ([]FeatureInfo, error) {
	var data NextData
	err := json.Unmarshal([]byte(jsonData), &data)
	if err != nil {
		return nil, fmt.Errorf("JSONパースエラー: %w", err)
	}
	return data.Props.PageProps.NaviSearchParam.FeatureInfoList, nil
}
