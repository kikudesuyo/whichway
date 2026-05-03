package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/kikudesuyo/whichway/api/app/handler"
)

func main() {
	mux := handler.NewMux()
	fmt.Println("サーバーを起動します: http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", mux))
}
