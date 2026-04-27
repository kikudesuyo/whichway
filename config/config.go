package config

import (
	"fmt"
	"os"
	"strings"

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
