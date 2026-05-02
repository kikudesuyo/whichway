import { Suspense } from 'react';
import RouteList from './RouteList';

function RouteListSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
      <div className="h-64 bg-slate-50/80 animate-pulse rounded-3xl border border-slate-100 shadow-sm" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 z-0">
      {/* Subtle animated background shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-50 blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/80 blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-sky-50 blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <main className="max-w-3xl mx-auto flex flex-col gap-10 p-4 sm:p-10 pt-12 sm:pt-20">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
            Which<span className="bg-gradient-to-br from-blue-600 to-indigo-500 bg-clip-text text-transparent">Way</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">
            最も効率的で快適なルートを導き出します。
          </p>
        </header>

        <Suspense fallback={<RouteListSkeleton />}>
          <RouteList />
        </Suspense>
      </main>
    </div>
  );
}
