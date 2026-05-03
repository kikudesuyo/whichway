package service

import (
	"fmt"
	"sort"
	"strings"
	"sync"

	"github.com/kikudesuyo/whichway/api/app/external"
)

func Search(fromStation, toStation string, preferredLines []string, viaPatterns []string) ([]UniqueRoute, error) {
	if fromStation == "" || toStation == "" {
		return nil, fmt.Errorf("from と to を指定してください")
	}

	if len(viaPatterns) == 0 {
		viaPatterns = []string{""}
	}

	var allScoredRoutes []ScoredRoute
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i, via := range viaPatterns {
		wg.Add(1)
		go func(i int, via string) {
			defer wg.Done()
			var vias []string
			if via != "" {
				vias = []string{via}
			}
			patternName := getPatternName(vias)

			routes, err := external.FetchRoutes(fromStation, toStation, vias)
			if err != nil {
				fmt.Printf("[%d/%d] %s -> 取得失敗: %v\n", i+1, len(viaPatterns), patternName, err)
				return
			}

			mu.Lock()
			for _, route := range routes {
				score := CalculateScore(route, preferredLines)
				allScoredRoutes = append(allScoredRoutes, ScoredRoute{
					Score:       score,
					Route:       route,
					ViaPatterns: vias,
				})
			}
			mu.Unlock()
		}(i, via)
	}
	wg.Wait()

	sort.SliceStable(allScoredRoutes, func(i, j int) bool {
		if allScoredRoutes[i].Score == allScoredRoutes[j].Score {
			timeI := ParseDurationToMinutes(allScoredRoutes[i].Route.SummaryInfo.TotalTime)
			timeJ := ParseDurationToMinutes(allScoredRoutes[j].Route.SummaryInfo.TotalTime)
			return timeI > timeJ
		}
		return allScoredRoutes[i].Score > allScoredRoutes[j].Score
	})

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

func getPatternName(vias []string) string {
	if len(vias) == 0 {
		return "経由なし"
	}
	return strings.Join(vias, ",") + " 経由"
}

func generateRouteKey(route external.TransitResp) string {
	var sb strings.Builder
	sb.WriteString(route.SummaryInfo.ArrivalTime)
	for _, edge := range route.EdgeInfoList {
		sb.WriteString("|")
		sb.WriteString(edge.StationName)
		sb.WriteString("|")
		sb.WriteString(edge.RailName)
	}
	return sb.String()
}
