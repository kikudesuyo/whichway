package cloudfunctions

import (

	// required by vendor dir deployment by Cloud Functions
	_ "github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
)

func init() {
	functions.HTTP("RunHTTPServer", app.RunHTTPServer)
}
