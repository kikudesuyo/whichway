import { Suspense } from 'react';
import RouteList from './RouteList';

function RouteListSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="h-40 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800" />
      <div className="h-40 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800" />
      <div className="h-40 bg-zinc-100 dark:bg-zinc-800/50 animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 p-4 sm:p-8">
      <main className="max-w-3xl mx-auto flex flex-col gap-8 mt-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Optimal Transit</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
            最も効率的で快適なルートを検索します。
          </p>
        </header>

        <Suspense fallback={<RouteListSkeleton />}>
          <RouteList />
        </Suspense>
      </main>
    </div>
  );
}
