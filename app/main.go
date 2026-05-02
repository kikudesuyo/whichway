package main

import (
	"fmt"
	"log"
	"net/http"
	"whichway/app/config"
	"whichway/app/handler"
)

func RunHTTPServer(w http.ResponseWriter, r *http.Request) {
	mux := newMux()
	mux.ServeHTTP(w, r)
}

func newMux() http.Handler {
	cfg, err := config.LoadConfig()
	if err != nil {
		panic("起動エラー: " + err.Error())
	}
	mux := http.NewServeMux()
	// cfgを渡す
	mux.HandleFunc("/api/routes", handler.RoutesHandler(cfg))

	return mux
}

func main() {
	mux := newMux()
	fmt.Println("サーバーを起動します: http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", mux))

}
