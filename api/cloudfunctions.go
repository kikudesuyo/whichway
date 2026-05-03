package cloudfunctions

import (
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/kikudesuyo/whichway/api/app/handler"
	
	// required by vendor dir deployment by Cloud Functions
	_ "github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
)

func init() {
	functions.HTTP("RunHTTPServer", handler.RunHTTPServer)
}
