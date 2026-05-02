import RouteCard from './RouteCard';
import { ApiResponse } from './types';

export default async function RouteList() {
  let routes: UniqueRoute[] = [];
  let error: string | null = null;

  try {
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
      <div className="text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200 w-full text-center">
        データの取得に失敗しました。<br />
        <span className="text-sm opacity-80">{error}</span>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-zinc-500 text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-200">
        ルートが見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full pb-20">
      {routes.slice(0, 10).map((r, i) => (
        <RouteCard key={i} r={r} i={i} />
      ))}
    </div>
  );
}
