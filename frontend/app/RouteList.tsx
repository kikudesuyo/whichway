import RouteCard from './RouteCard';
import { UniqueRoute, ApiResponse } from './types';

interface Props {
  from: string;
  to: string;
  preferredLines?: string | string[];
  viaPatterns?: string | string[];
}

const toArray = (v: string | string[] | undefined): string[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

export default async function RouteList({ from, to, preferredLines, viaPatterns }: Props) {
  let routes: UniqueRoute[] = [];
  let error: string | null = null;

  try {
    const params = new URLSearchParams({ from, to });
    toArray(preferredLines).forEach(v => params.append('preferred_lines', v));
    toArray(viaPatterns).forEach(v => params.append('via_patterns', v));
    const url = `http://localhost:8081/api/routes?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    const data: ApiResponse = await res.json();
    routes = data.routes || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-50/50 rounded-[2.5rem] border border-rose-100 shadow-sm w-full text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-rose-900 tracking-tight">データの取得に失敗しました</h3>
          <p className="text-sm text-rose-600 font-bold opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm w-full gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">ルートが見つかりませんでした</h3>
          <p className="text-sm text-slate-500 font-medium">条件を変えて再度お試しください</p>
        </div>
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
