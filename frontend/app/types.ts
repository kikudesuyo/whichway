export interface RouteEdge {
  stationName: string;
  railName: string;
  timeInfo: Array<{ time: string; type: number }>;
  ridingPositionInfo?: { departure?: string[]; arrival?: string[]; position?: string[] } | null;
  stopStationList?: Array<{ name: string; departureTime: string }>;
  diaInfoStatus?: Array<Record<string, string | number | boolean | null>>;
}

export interface UniqueRoute {
  ScoredRoute: {
    Score: number;
    Route: {
      summaryInfo: {
        departureTime: string;
        arrivalTime: string;
        totalTime: string;
        totalPrice: string;
        transferCount: string;
      };
      edgeInfoList: RouteEdge[];
    };
    ViaPatterns: string[] | null;
  };
}

export interface ApiResponse {
  routes: UniqueRoute[];
}
