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
      edgeInfoList: Array<{
        stationName: string;
        railName: string;
        timeInfo: Array<{
          time: string;
          type: number;
        }>;
      }>;
    };
    ViaPatterns: string[] | null;
  };
}

export interface ApiResponse {
  routes: UniqueRoute[];
}
