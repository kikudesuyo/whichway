package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"whichway/app/config"
	"whichway/app/search"
)

type Response struct {
	Routes []search.UniqueRoute `json:"routes"`
}

func RoutesHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		uniqueRoutes, err := search.RunAll(cfg)
		if err != nil {
			fmt.Println("検索エラー:", err)
			http.Error(w, "ルートの検索に失敗しました", http.StatusInternalServerError)
			return
		}

		res := Response{
			Routes: uniqueRoutes,
		}

		json.NewEncoder(w).Encode(res)
	}
}
