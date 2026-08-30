'use client';

import { useEffect, useState } from 'react';
import RouteCard from './RouteCard';
import { UniqueRoute } from './types';

const CACHE_PREFIX = 'whichway_routes:';

function cacheKey(from: string, to: string, preferredLines: string[], viaPatterns: string[]) {
  return `${CACHE_PREFIX}${JSON.stringify({ from, to, preferredLines, viaPatterns })}`;
}

export default function RouteResults({
  routes,
  error,
  from,
  to,
  preferredLines,
  viaPatterns,
}: {
  routes: UniqueRoute[];
  error: string | null;
  from: string;
  to: string;
  preferredLines: string[];
  viaPatterns: string[];
}) {
  const [displayRoutes, setDisplayRoutes] = useState(routes);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const key = cacheKey(from, to, preferredLines, viaPatterns);
    try {
      if (routes.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayRoutes(routes);
        setIsCached(false);
        localStorage.setItem(key, JSON.stringify(routes));
        return;
      }
      setDisplayRoutes([]);
      const cached = localStorage.getItem(key);
      if (cached) {
        setDisplayRoutes(JSON.parse(cached) as UniqueRoute[]);
        setIsCached(true);
      }
    } catch {
      // localStorage が使えない環境では通常の結果表示を継続する
    }
  }, [from, to, preferredLines, viaPatterns, routes]);

  if (displayRoutes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm w-full gap-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {error ? 'ルートを取得できませんでした' : 'ルートが見つかりませんでした'}
        </h3>
        <p className="text-sm text-slate-500 font-medium">{error ?? '条件を変えて再度お試しください'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full pb-20">
      {isCached && <p className="text-xs font-bold text-amber-600 px-2">前回取得した検索結果を表示しています</p>}
      {displayRoutes.slice(0, 10).map((route, index) => (
        <RouteCard key={index} r={route} i={index} />
      ))}
    </div>
  );
}
