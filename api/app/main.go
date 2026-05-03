package app

import (
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/kikudesuyo/whichway/api/app/handler"
)

func RunHTTPServer(w http.ResponseWriter, r *http.Request) {
	mux := NewMux()
	mux.ServeHTTP(w, r)
}

func NewMux() http.Handler {
	// Cloud Functions does not need .env normally,
	// but we keep it for local and fallback compatibility.
	_ = godotenv.Load()
	if _, err := os.Stat("../../.env"); err == nil {
		_ = godotenv.Load("../../.env")
	} else if _, err := os.Stat(".env"); err == nil {
		_ = godotenv.Load(".env")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/routes", handler.HandleRoutes)

	return mux
}
