'use client';

import { useState } from 'react';
import { RouteEdge, UniqueRoute } from './types';

const InfoChip = ({ children, icon, color = "slate" }: { children: React.ReactNode, icon?: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
  };
  
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border text-[9px] sm:text-[10px] font-bold tracking-tight ${colors[color]}`}>
      {icon}
      {children}
    </span>
  );
};

export default function RouteCard({ r, i }: { r: UniqueRoute, i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const edges = r.ScoredRoute.Route.edgeInfoList;
  
  const isThroughService = (edge: RouteEdge, idx: number) => {
    if (idx === 0 || idx === edges.length - 1) return false;
    const arrTime = edge.timeInfo.find((t) => t.type === 2 || t.type === 4)?.time;
    const depTime = edge.timeInfo.find((t) => t.type === 1 || t.type === 3)?.time;
    return arrTime === depTime && arrTime !== undefined;
  };

  const significantEdges = edges.filter((edge, idx) => !isThroughService(edge, idx));
  const isDirect = r.ScoredRoute.Route.summaryInfo.transferCount === "0";

  const getPlatform = (edge: RouteEdge, kind: 'departure' | 'arrival') =>
    edge.ridingPositionInfo?.[kind]?.join('') || null;

  const getDelayLabel = (edge: RouteEdge) => {
    const status = edge.diaInfoStatus?.[0];
    if (!status) return null;
    const text = Object.values(status).find((value: unknown) => typeof value === 'string');
    return text ? String(text) : '運行情報あり';
  };

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-[1.8rem] sm:rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-500 ease-out overflow-hidden mb-4 mx-1">
      {/* Main Header / Summary (Always visible) */}
      <div 
        className="p-5 sm:p-8 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <span className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                {r.ScoredRoute.Route.summaryInfo.departureTime}
              </span>
              <div className="w-5 sm:w-8 h-[2px] bg-slate-200 rounded-full" />
              <span className="text-2xl sm:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                {r.ScoredRoute.Route.summaryInfo.arrivalTime}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {i === 0 ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 19h20v2H2v-2zm2-2l-1.5-9L8 11l4-8 4 8 5.5-3L20 17H4z" />
                </svg>
              ) : (
                <span className={`text-xs sm:text-sm font-black tabular-nums ${
                  i === 1 ? 'text-slate-500' :
                  i === 2 ? 'text-orange-500' :
                  'text-slate-300'
                }`}>
                  #{i + 1}
                </span>
              )}
              <div className={`p-1.5 sm:p-2 rounded-full bg-slate-50 text-slate-600 transition-all duration-200 ${isOpen ? 'rotate-180 bg-slate-900 text-white' : ''}`}>
                <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <InfoChip icon={<svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
              {r.ScoredRoute.Route.summaryInfo.totalTime}
            </InfoChip>
            <InfoChip color="emerald">{r.ScoredRoute.Route.summaryInfo.totalPrice}円</InfoChip>
            {isDirect ? (
              <InfoChip color="amber">乗り換えなし</InfoChip>
            ) : (
              <InfoChip>乗換{r.ScoredRoute.Route.summaryInfo.transferCount}回</InfoChip>
            )}
          </div>

          {/* Optimized Route Summary (Responsive) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-1.5 sm:gap-x-3">
              {significantEdges.map((edge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight whitespace-nowrap">{edge.stationName}</span>
                  {idx < significantEdges.length - 1 && (
                    <div className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-slate-50 border border-slate-100 rounded-md sm:rounded-lg">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate max-w-[60px] sm:max-w-none">
                        {edges[edges.findIndex(e => e.stationName === edge.stationName)].railName}
                      </span>
                      <svg className="w-2.5 h-2.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details (Timeline) */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-5 pb-6 sm:px-8 sm:pb-12 pt-2 border-t border-slate-50">
          <div className="bg-slate-50/70 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 border border-slate-100/50">
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[9px] sm:left-[11px] top-6 bottom-6 w-0.5 bg-slate-200/80 z-0"></div>
              
              {edges.map((edge, eIdx) => {
                if (isThroughService(edge, eIdx)) return null;

                return (
                  <div key={eIdx} className="flex gap-4 sm:gap-6 items-start relative z-10 py-2 sm:py-3 group/edge">
                    <div className={`w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] rounded-full border-[4px] sm:border-[5px] mt-1 flex-shrink-0 shadow-md transition-all duration-500 ${eIdx === 0 || eIdx === edges.length - 1 ? 'bg-white border-slate-900 scale-110' : 'bg-white border-slate-300'}`} />
                    <div className="flex flex-col w-full min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <p className={`font-black text-base sm:text-xl tracking-tighter truncate ${eIdx === 0 || eIdx === edges.length - 1 ? 'text-slate-900' : 'text-slate-800'}`}>
                          {edge.stationName}
                        </p>
                        {edge.timeInfo && edge.timeInfo.length > 0 && (
                          <div className="flex gap-1.5 sm:gap-2 items-center overflow-x-auto no-scrollbar">
                            {edge.timeInfo.map((ti, tIdx: number) => {
                              const label = ti.type === 1 || (ti.type === 3 && eIdx === 0) ? "発" : "着";
                              const colorClasses = label === "発" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-orange-50 text-orange-700 border-orange-100";
                              
                              return (
                                <span key={tIdx} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-black rounded-md sm:rounded-lg border whitespace-nowrap ${colorClasses} shadow-sm`}>
                                  {ti.time} <span className="opacity-60 font-bold text-[8px] sm:text-[10px] ml-0.5">{label}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {(getPlatform(edge, 'departure') || getPlatform(edge, 'arrival') || getDelayLabel(edge)) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getPlatform(edge, 'departure') && (
                            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                              {eIdx === 0 ? '出発' : '乗換'} {getPlatform(edge, 'departure')}
                            </span>
                          )}
                          {eIdx > 0 && getPlatform(edge, 'arrival') && (
                            <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black">
                              到着 {getPlatform(edge, 'arrival')}
                            </span>
                          )}
                          {getDelayLabel(edge) && (
                            <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black">
                              遅延: {getDelayLabel(edge)}
                            </span>
                          )}
                        </div>
                      )}

                      {(edge.stopStationList ?? []).length > 0 && (
                        <details className="mt-2 text-xs text-slate-500">
                          <summary className="cursor-pointer font-bold">途中駅 {(edge.stopStationList ?? []).length}駅</summary>
                          <p className="mt-1 leading-6">{(edge.stopStationList ?? []).map((stop) => `${stop.name} ${stop.departureTime}`).join(' · ')}</p>
                        </details>
                      )}

                      {eIdx < edges.length - 1 && (
                        <div className="mt-3 mb-4 sm:mt-4 sm:mb-6 relative">
                          <div className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm inline-flex items-center gap-2 sm:gap-3 max-w-full overflow-hidden transition-all duration-300">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                            <span className="text-[10px] sm:text-sm font-black text-slate-700 tracking-tight truncate">
                              {edge.railName}
                              {isThroughService(edges[eIdx + 1], eIdx + 1) && (
                                <span className="ml-1.5 px-1 py-0.5 bg-slate-100 text-slate-500 text-[8px] sm:text-[10px] rounded uppercase font-black">直通</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
