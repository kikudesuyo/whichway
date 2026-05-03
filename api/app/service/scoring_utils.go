package service

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/kikudesuyo/whichway/api/app/external"
)

func CalculateScore(route external.TransitResp, preferredLines []string) int {
	score := 0

	minutesFromNow := getAbsoluteMinutesFromNow(route.SummaryInfo.ArrivalTime)
	score -= minutesFromNow * 10

	price := parsePrice(route.SummaryInfo.TotalPrice)
	score -= price / 10

	transfers, _ := strconv.Atoi(route.SummaryInfo.TransferCount)
	score -= transfers * 50

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
	jst, _ := time.LoadLocation("Asia/Tokyo")
	now := time.Now().In(jst)
	parts := strings.Split(timeStr, ":")
	if len(parts) != 2 {
		return 0
	}
	h, _ := strconv.Atoi(parts[0])
	m, _ := strconv.Atoi(parts[1])

	target := time.Date(now.Year(), now.Month(), now.Day(), h, m, 0, 0, now.Location())

	if target.Before(now) && now.Hour() >= 20 && h <= 4 {
		target = target.Add(24 * time.Hour)
	}

	diff := target.Sub(now)
	if diff < 0 {
		return 0
	}
	return int(diff.Minutes())
}
