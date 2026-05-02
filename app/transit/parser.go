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
	
	features := data.Props.PageProps.NaviSearchParam.FeatureInfoList
	
	// 乗換不要（相互直通など）の同一列車エッジを除外する
	for i := range features {
		var filteredEdges []EdgeInfo
		for _, edge := range features[i].EdgeInfoList {
			// state == 2 または pointName に "乗換不要" が含まれる場合は直通運転の境界駅
			if edge.State == 2 || regexp.MustCompile(`乗換不要`).MatchString(edge.PointName) {
				continue
			}
			filteredEdges = append(filteredEdges, edge)
		}
		features[i].EdgeInfoList = filteredEdges
	}
	
	return features, nil
}
