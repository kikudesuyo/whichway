package scoring

import (
	"regexp"
	"strconv"
	"strings"
	"time"
	"whichway/app/transit"
)

type ScoredRoute struct {
	Score       int
	Route       transit.FeatureInfo
	ViaPatterns []string
}

// 独自のスコアリングアルゴリズム
func CalculateScore(route transit.FeatureInfo, preferredLines []string) int {
	score := 0

	// 1. 待ち時間も含めた「現在時刻から到着までのトータル時間」のペナルティ (1分 = -10点)
	// （いくら乗車時間が短くても、到着が遅くなるルートはペナルティ)
	minutesFromNow := getAbsoluteMinutesFromNow(route.SummaryInfo.ArrivalTime)
	score -= minutesFromNow * 10

	// 2. 料金のペナルティ (10円 = -1点)
	price := parsePrice(route.SummaryInfo.TotalPrice)
	score -= price / 10

	// 3. 乗り換え回数のペナルティ (1回 = -50点)
	transfers, _ := strconv.Atoi(route.SummaryInfo.TransferCount)
	score -= transfers * 50

	// 4. 優先路線のボーナス
	matchedPref := make(map[string]bool)
	for _, edge := range route.EdgeInfoList {
		for _, pref := range preferredLines {
			pref = strings.TrimSpace(pref)
			if pref != "" && strings.Contains(edge.RailName, pref) {
				matchedPref[pref] = true
			}
		}
	}
	score += len(matchedPref) * 50

	return score
}

func ParseDurationToMinutes(durationStr string) int {
	totalMinutes := 0

	hourRe := regexp.MustCompile(`(\d+)時間`)
	hourMatches := hourRe.FindStringSubmatch(durationStr)
	if len(hourMatches) > 1 {
		hours, _ := strconv.Atoi(hourMatches[1])
		totalMinutes += hours * 60
	}

	minRe := regexp.MustCompile(`(\d+)分`)
	minMatches := minRe.FindStringSubmatch(durationStr)
	if len(minMatches) > 1 {
		mins, _ := strconv.Atoi(minMatches[1])
		totalMinutes += mins
	}

	return totalMinutes
}

func parsePrice(priceStr string) int {
	clean := strings.ReplaceAll(priceStr, ",", "")
	price, _ := strconv.Atoi(clean)
	return price
}

func getAbsoluteMinutesFromNow(timeStr string) int {
	now := time.Now()
	// timeStr example: "23:11" or "00:41"
	parts := strings.Split(timeStr, ":")
	if len(parts) != 2 {
		return 0
	}
	h, _ := strconv.Atoi(parts[0])
	m, _ := strconv.Atoi(parts[1])

	target := time.Date(now.Year(), now.Month(), now.Day(), h, m, 0, 0, now.Location())

	// 深夜またぎの考慮:現在が夜で、到着が0〜4時の場合は翌日として扱う
	if target.Before(now) && now.Hour() >= 20 && h <= 4 {
		target = target.Add(24 * time.Hour)
	}

	diff := target.Sub(now)
	if diff < 0 {
		return 0 // 過去の時間は0とする（通常はないはず）
	}
	return int(diff.Minutes())
}
