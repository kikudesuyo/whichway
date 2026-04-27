package main

import (
	"fmt"
	"strings"

	"whichway/config"
	"whichway/search"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		fmt.Println("起動エラー:", err)
		return
	}
	display(cfg)
}

func display(cfg *config.Config) {
	uniqueRoutes, err := search.RunAll(cfg)
	if err != nil {
		fmt.Println("検索エラー:", err)
		return
	}

	fmt.Println("\n=============================================")
	fmt.Println("  🏆 最善のルート総合ランキング（スコア順）")
	fmt.Println("=============================================")

	limit := 5
	if len(uniqueRoutes) < limit {
		limit = len(uniqueRoutes)
	}

	for i := 0; i < limit; i++ {
		ur := uniqueRoutes[i]
		route := ur.ScoredRoute.Route
		viaStr := strings.Join(ur.FoundIn, " / ")

		fmt.Printf("\n【第%d位】スコア: %d 点 （%s）\n", i+1, ur.ScoredRoute.Score, viaStr)
		fmt.Printf("出発: %s -> 到着: %s (所要時間: %s / 料金: %s円 / 乗換: %s回)\n",
			route.SummaryInfo.DepartureTime,
			route.SummaryInfo.ArrivalTime,
			route.SummaryInfo.TotalTime,
			route.SummaryInfo.TotalPrice,
			route.SummaryInfo.TransferCount,
		)
		for _, edge := range route.EdgeInfoList {
			// 徒歩などの場合は路線名がないためスキップ
			if edge.RailName == "" {
				continue
			}
			// 優先路線にマッチしているかチェック
			isPref := false
			for _, pref := range cfg.PreferredLines {
				pref = strings.TrimSpace(pref)
				if pref != "" && strings.Contains(edge.RailName, pref) {
					isPref = true
					break
				}
			}

			prefMark := ""
			if isPref {
				prefMark = " ★好条件★"
			}
			fmt.Printf("  ↓ [%s] から %s %s\n", edge.StationName, edge.RailName, prefMark)
		}
	}

}
