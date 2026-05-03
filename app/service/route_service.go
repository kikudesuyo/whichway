package service

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"whichway/app/external"

	"github.com/joho/godotenv"
)

type Config struct {
	FromStation    string
	ToStation      string
	PreferredLines []string
	ViaPatterns    [][]string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		err = godotenv.Load("../.env")
	}
	if err != nil {
		fmt.Println("Warning: .envファイルが見つからないか読み込めませんでした")
	}

	fromStation := os.Getenv("FROM_STATION")
	toStation := os.Getenv("TO_STATION")
	if fromStation == "" || toStation == "" {
		return nil, fmt.Errorf(".env に FROM_STATION と TO_STATION を設定してください")
	}

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
	return &Config{
		FromStation:    fromStation,
		ToStation:      toStation,
		PreferredLines: preferredLines,
		ViaPatterns:    viaPatterns,
	}, nil
}

func Search() ([]UniqueRoute, error) {
	var allScoredRoutes []ScoredRoute
	cfg, err := LoadConfig()
	if err != nil {
		return nil, err
	}

	for i, vias := range cfg.ViaPatterns {
		patternName := getPatternName(vias)

		fmt.Printf("[%d/%d] %s のルートを検索中...\n", i+1, len(cfg.ViaPatterns), patternName)

		routes, err := external.FetchRoutes(cfg.FromStation, cfg.ToStation, vias)
		if err != nil {
			fmt.Println("  -> 取得失敗:", err)
			continue
		}

		for _, route := range routes {
			score := CalculateScore(route, cfg.PreferredLines)
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
