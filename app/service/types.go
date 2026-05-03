package service

import "whichway/app/external"

type ScoredRoute struct {
	Score       int
	Route       external.TransitResp
	ViaPatterns []string
}

type UniqueRoute struct {
	ScoredRoute ScoredRoute
}
