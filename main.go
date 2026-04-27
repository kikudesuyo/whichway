package main

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"whichway/config"
	"whichway/search"
)

func main() {
	r := gin.Default()

	// CORS設定: FE(別ポートなど)からのアクセスを許可
	r.Use(cors.Default())

	r.GET("/api/routes", func(c *gin.Context) {
		cfg, err := config.LoadConfig()
		if err != nil {
			fmt.Println("起動エラー:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "設定の読み込みに失敗しました"})
			return
		}
		uniqueRoutes, err := search.RunAll(cfg)
		if err != nil {
			fmt.Println("検索エラー:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ルートの検索に失敗しました"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"routes": uniqueRoutes,
		})
	})

	fmt.Println("サーバーを起動します: http://localhost:8081")
	r.Run(":8081")
}
