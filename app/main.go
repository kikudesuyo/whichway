package main

import (
	"fmt"
	"log"
	"net/http"
	"whichway/app/handler"

	"github.com/joho/godotenv"
)

func RunHTTPServer(w http.ResponseWriter, r *http.Request) {
	mux := newMux()
	mux.ServeHTTP(w, r)
}

func newMux() http.Handler {
	err := godotenv.Load()
	if err != nil {
		godotenv.Load("../.env")
	}

	mux := http.NewServeMux()
	// ハンドラを登録
	mux.HandleFunc("/api/routes", handler.HandleRoutes)

	return mux
}

func main() {
	mux := newMux()
	fmt.Println("サーバーを起動します: http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", mux))

}
