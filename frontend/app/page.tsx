import { Suspense } from 'react';
import RouteList from './RouteList';
import SearchForm from './SearchForm';

interface SearchParams {
  from?: string;
  to?: string;
  preferred_lines?: string | string[];
  via_patterns?: string | string[];
}

interface Props {
  searchParams: Promise<SearchParams>;
}

function RouteListSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
    </div>
  );
}

export default async function Home({ searchParams }: Props) {
  const { from, to, preferred_lines, via_patterns } = await searchParams;
  const hasSearch = !!from && !!to;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 z-0">

      <main className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 pt-6 sm:pt-12">
        <header className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            {/* 左ロゴ */}
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 10H14L20 16H26" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 24L12 18L18 12H26" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 leading-none drop-shadow-sm">
              Which<span className="bg-gradient-to-br from-blue-600 to-indigo-500 bg-clip-text text-transparent">Way</span>
            </h1>

            {/* 右ロゴ（水平反転） */}
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-x-[-1]">
              <path d="M6 10H14L20 16H26" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 24L12 18L18 12H26" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-tight">
            最も効率的で快適なルートを提案します。
          </p>
        </header>

        {/* 検索フォーム */}
        <Suspense>
          <SearchForm />
        </Suspense>

        {/* 検索結果 */}
        {hasSearch && (
          <Suspense fallback={<RouteListSkeleton />}>
            <RouteList from={from} to={to} preferredLines={preferred_lines} viaPatterns={via_patterns} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
