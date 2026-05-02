// This is a Next.js Server Component (RSC)
// It fetches data directly on the server side

interface UniqueRoute {
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
      }>;
    };
    ViaPatterns: string[] | null;
  };
  FoundIn: string[];
}

interface ApiResponse {
  routes: UniqueRoute[];
}

export default async function RouteList() {
  let routes: UniqueRoute[] = [];
  let error: string | null = null;

  try {
    // Fetch data directly on the server
    // cache: 'no-store' ensures it fetches fresh data every time
    const res = await fetch('http://localhost:8081/api/routes', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch routes');
    const data: ApiResponse = await res.json();
    routes = data.routes || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200 dark:border-red-900 w-full text-center">
        データの取得に失敗しました。<br />
        <span className="text-sm opacity-80">{error}</span>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-zinc-500 text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        ルートが見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {routes.slice(0, 10).map((r, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  {r.ScoredRoute.Route.summaryInfo.departureTime}
                </span>
                <span className="text-zinc-400 font-light">→</span>
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  {r.ScoredRoute.Route.summaryInfo.arrivalTime}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                  <span className="text-xs">スコア</span>
                  <span className="font-bold text-base">{r.ScoredRoute.Score}</span>
                </div>
                <span>{r.ScoredRoute.Route.summaryInfo.totalTime}</span>
                <span>•</span>
                <span>{r.ScoredRoute.Route.summaryInfo.totalPrice}</span>
                <span>•</span>
                <span>乗換 {r.ScoredRoute.Route.summaryInfo.transferCount}回</span>
              </div>
            </div>
            
            <div className="flex gap-1.5 flex-wrap justify-end max-w-[40%]">
              {r.FoundIn.map((pattern, pIdx) => (
                <span key={pIdx} className="px-2.5 py-1 bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800/50">
                  {pattern}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-black/40 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-zinc-200 dark:bg-zinc-800 z-0 rounded-full"></div>
              {r.ScoredRoute.Route.edgeInfoList.map((edge, eIdx) => (
                <div key={eIdx} className="flex gap-4 items-start relative z-10 py-1.5">
                  <div className="w-[20px] h-[20px] rounded-full bg-white dark:bg-zinc-900 border-[5px] border-zinc-400 dark:border-zinc-600 mt-0.5 flex-shrink-0 shadow-sm" />
                  <div className="flex flex-col -mt-1">
                    <p className="font-bold text-base text-zinc-900 dark:text-zinc-100">{edge.stationName}</p>
                    {eIdx < r.ScoredRoute.Route.edgeInfoList.length - 1 && (
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 pb-3">{edge.railName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
