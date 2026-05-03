package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/kikudesuyo/whichway/api/app/service"
)

type RouteSearchParams struct {
	From           string
	To             string
	PreferredLines []string
	ViaPatterns    []string
}

type RouteResp struct {
	Routes []service.UniqueRoute `json:"routes"`
}

type ErrorResp struct {
	Error string `json:"error"`
}

func HandleRoutes(w http.ResponseWriter, r *http.Request) {
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

	params := RouteSearchParams{
		From:           r.URL.Query().Get("from"),
		To:             r.URL.Query().Get("to"),
		PreferredLines: r.URL.Query()["preferred_lines"],
		ViaPatterns:    r.URL.Query()["via_patterns"],
	}
	if params.From == "" || params.To == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResp{Error: "from と to クエリパラメータが必要です"})
		return
	}

	uniqueRoutes, err := service.Search(params.From, params.To, params.PreferredLines, params.ViaPatterns)
	if err != nil {
		fmt.Println("検索エラー:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResp{Error: "ルートの検索に失敗しました"})
		return
	}

	json.NewEncoder(w).Encode(RouteResp{Routes: uniqueRoutes})
}
