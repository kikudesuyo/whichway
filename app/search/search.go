package search

import (
	"fmt"
	"sort"
	"strings"
	"whichway/app/config"
	"whichway/app/scoring"
	"whichway/app/transit"
)

type UniqueRoute struct {
	ScoredRoute scoring.ScoredRoute
}

func getPatternName(vias []string) string {
	if len(vias) == 0 {
		return "経由なし"
	}
	return strings.Join(vias, ",") + " 経由"
}

func RunAll(cfg *config.Config) ([]UniqueRoute, error) {
	var allScoredRoutes []scoring.ScoredRoute

	for i, vias := range cfg.ViaPatterns {
		patternName := getPatternName(vias)
		fmt.Printf("[%d/%d] %s のルートを検索中...\n", i+1, len(cfg.ViaPatterns), patternName)

		html, err := transit.FetchRoutesHTML(cfg.FromStation, cfg.ToStation, vias)
		if err != nil {
			fmt.Println("  -> 取得失敗:", err)
			continue
		}

		jsonData, err := transit.ExtractJSONData(html)
		if err != nil {
			fmt.Println("  -> JSON抽出失敗:", err)
			continue
		}

		routes, err := transit.ParseRoutes(jsonData)
		if err != nil {
			fmt.Println("  -> 解析失敗:", err)
			continue
		}

		for _, route := range routes {
			score := scoring.CalculateScore(route, cfg.PreferredLines)
			allScoredRoutes = append(allScoredRoutes, scoring.ScoredRoute{
				Score:       score,
				Route:       route,
				ViaPatterns: vias,
			})
		}
	}

	// スコアが高い順にソート。スコアが同じ場合は出発時間が早い方（所要時間が長い方）を優先
	sort.SliceStable(allScoredRoutes, func(i, j int) bool {
		if allScoredRoutes[i].Score == allScoredRoutes[j].Score {
			timeI := scoring.ParseDurationToMinutes(allScoredRoutes[i].Route.SummaryInfo.TotalTime)
			timeJ := scoring.ParseDurationToMinutes(allScoredRoutes[j].Route.SummaryInfo.TotalTime)
			return timeI > timeJ
		}
		return allScoredRoutes[i].Score > allScoredRoutes[j].Score
	})

	// --- 結果の重複排除 ---
	var uniqueRoutes []UniqueRoute
	seenKeys := make(map[string]int)

	for _, sr := range allScoredRoutes {
		key := generateRouteKey(sr.Route)

		if _, exists := seenKeys[key]; !exists {
			seenKeys[key] = len(uniqueRoutes)
			uniqueRoutes = append(uniqueRoutes, UniqueRoute{
				ScoredRoute: sr,
			})
		}
	}

	return uniqueRoutes, nil
}

func generateRouteKey(route transit.FeatureInfo) string {
	var sb strings.Builder
	// 出発時間をキーから除外することで、同じ到着時間＆同じ経路のバリエーションを1つにまとめる
	sb.WriteString(route.SummaryInfo.ArrivalTime)
	for _, edge := range route.EdgeInfoList {
		sb.WriteString("|")
		sb.WriteString(edge.StationName)
		sb.WriteString("|")
		sb.WriteString(edge.RailName)
	}
	return sb.String()
}
