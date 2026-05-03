package service

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"whichway/app/external"
)

func Search() ([]UniqueRoute, error) {
	fromStation := os.Getenv("FROM_STATION")
	toStation := os.Getenv("TO_STATION")
	if fromStation == "" || toStation == "" {
		return nil, fmt.Errorf("FROM_STATION and TO_STATION must be set in environment variables")
	}

	preferredLines := getPreferredLines()
	viaPatterns := getViaPatterns()

	var allScoredRoutes []ScoredRoute

	for i, vias := range viaPatterns {
		patternName := getPatternName(vias)
		fmt.Printf("[%d/%d] %s のルートを検索中...\n", i+1, len(viaPatterns), patternName)

		routes, err := external.FetchRoutes(fromStation, toStation, vias)
		if err != nil {
			fmt.Println("  -> 取得失敗:", err)
			continue
		}

		for _, route := range routes {
			score := CalculateScore(route, preferredLines)
			allScoredRoutes = append(allScoredRoutes, ScoredRoute{
				Score:       score,
				Route:       route,
				ViaPatterns: vias,
			})
		}
	}

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

func getPreferredLines() []string {
	preferredLinesStr := os.Getenv("PREFERRED_LINES")
	var preferredLines []string
	if preferredLinesStr != "" {
		for _, line := range strings.Split(preferredLinesStr, ",") {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				preferredLines = append(preferredLines, trimmed)
			}
		}
	}
	return preferredLines
}

func getViaPatterns() [][]string {
	viaPatternsStr := os.Getenv("VIA_PATTERNS")
	var viaPatterns [][]string
	if viaPatternsStr == "" {
		viaPatterns = [][]string{nil}
	} else {
		for _, pattern := range strings.Split(viaPatternsStr, "|") {
			pattern = strings.TrimSpace(pattern)
			if pattern == "" {
				viaPatterns = append(viaPatterns, nil)
				continue
			}
			var vias []string
			for _, v := range strings.Split(pattern, ",") {
				trimmed := strings.TrimSpace(v)
				if trimmed != "" {
					vias = append(vias, trimmed)
				}
			}
			viaPatterns = append(viaPatterns, vias)
		}
	}
	return viaPatterns
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
