package search

import (
	"fmt"
	"sort"
	"strings"

	"whichway/config"
	"whichway/scoring"
	"whichway/transit"
)

type UniqueRoute struct {
	ScoredRoute scoring.ScoredRoute
	FoundIn     []string
}

func RunAll(cfg *config.Config) ([]UniqueRoute, error) {
	var allScoredRoutes []scoring.ScoredRoute

	for i, vias := range cfg.ViaPatterns {
		patternName := "経由なし"
		if len(vias) > 0 {
			patternName = strings.Join(vias, ",") + " 経由"
		}
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

	// スコアが高い順にソート
	sort.SliceStable(allScoredRoutes, func(i, j int) bool {
		return allScoredRoutes[i].Score > allScoredRoutes[j].Score
	})

	// --- 結果の重複排除 ---
	var uniqueRoutes []UniqueRoute
	seenKeys := make(map[string]int)

	for _, sr := range allScoredRoutes {
		key := generateRouteKey(sr.Route)

		patternName := "経由なし"
		if len(sr.ViaPatterns) > 0 {
			patternName = strings.Join(sr.ViaPatterns, ",") + " 経由"
		}

		if idx, exists := seenKeys[key]; exists {
			alreadyAdded := false
			for _, existingPattern := range uniqueRoutes[idx].FoundIn {
				if existingPattern == patternName {
					alreadyAdded = true
					break
				}
			}
			if !alreadyAdded {
				uniqueRoutes[idx].FoundIn = append(uniqueRoutes[idx].FoundIn, patternName)
			}
		} else {
			seenKeys[key] = len(uniqueRoutes)
			uniqueRoutes = append(uniqueRoutes, UniqueRoute{
				ScoredRoute: sr,
				FoundIn:     []string{patternName},
			})
		}
	}

	return uniqueRoutes, nil
}

func generateRouteKey(route transit.FeatureInfo) string {
	var sb strings.Builder
	sb.WriteString(route.SummaryInfo.DepartureTime)
	sb.WriteString("-")
	sb.WriteString(route.SummaryInfo.ArrivalTime)
	for _, edge := range route.EdgeInfoList {
		sb.WriteString(edge.StationName)
		sb.WriteString(edge.RailName)
	}
	return sb.String()
}
