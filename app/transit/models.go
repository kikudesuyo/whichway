package transit

type NextData struct {
	Props struct {
		PageProps struct {
			NaviSearchParam struct {
				FeatureInfoList []FeatureInfo `json:"featureInfoList"`
			} `json:"naviSearchParam"`
		} `json:"pageProps"`
	} `json:"props"`
}

// 1つのルート（経路）情報の構造体
type FeatureInfo struct {
	SummaryInfo  SummaryInfo `json:"summaryInfo"`
	EdgeInfoList []EdgeInfo  `json:"edgeInfoList"`
}

type SummaryInfo struct {
	DepartureTime string `json:"departureTime"`
	ArrivalTime   string `json:"arrivalTime"`
	TotalTime     string `json:"totalTime"`
	TotalPrice    string `json:"totalPrice"`
	TimeOnBoard   string `json:"timeOnBoard"`
	TransferCount string `json:"transferCount"`
	IsFast        bool   `json:"isFast"`
	IsEasy        bool   `json:"isEasy"`
	IsCheap       bool   `json:"isCheap"`
	Distance      string `json:"distance"`
}

type EdgeInfo struct {
	StationName                  string     `json:"stationName"`
	RailName                     string     `json:"railName"`
	RailNameExcludingDestination string     `json:"railNameExcludingDestination"`
	Destination                  string     `json:"destination"`
	State                        int        `json:"state"`
	PointName                    string     `json:"pointName"`
	TimeInfo                     []TimeInfo `json:"timeInfo"`
	PriceInfo                    PriceInfo  `json:"priceInfo"`
}

type TimeInfo struct {
	Time string `json:"time"`
	Type int    `json:"type"`
}

type PriceInfo struct {
	Price string `json:"price"`
}
