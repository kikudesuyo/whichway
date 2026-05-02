'use client';

import { useState } from 'react';
import { UniqueRoute } from './types';

const InfoChip = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100 text-xs font-bold text-slate-600">
    {icon}
    {children}
  </span>
);

export default function RouteCard({ r, i }: { r: UniqueRoute, i: number }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique rail names for the summary
  const rails = r.ScoredRoute.Route.edgeInfoList
    .map(edge => edge.railName)
    .filter((name, index, self) => name && self.indexOf(name) === index);

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300 ease-out overflow-hidden">
      {/* Main Header / Summary (Always visible) */}
      <div 
        className="p-5 sm:p-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {r.ScoredRoute.Route.summaryInfo.departureTime}
              </span>
              <div className="flex items-center">
                <div className="w-4 h-[1.5px] bg-slate-300 rounded-full" />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {r.ScoredRoute.Route.summaryInfo.arrivalTime}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                <span className="text-[9px] font-bold uppercase opacity-60">Score</span>
                <span className="font-extrabold text-xs">{r.ScoredRoute.Score}</span>
              </div>
              <div className={`p-1.5 rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <InfoChip icon={<svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
              {r.ScoredRoute.Route.summaryInfo.totalTime}
            </InfoChip>
            <InfoChip>{r.ScoredRoute.Route.summaryInfo.totalPrice}円</InfoChip>
            <InfoChip>乗換{r.ScoredRoute.Route.summaryInfo.transferCount}回</InfoChip>
          </div>

          {/* Rail Summary (Important for closed state) */}
          <div className="flex flex-col gap-2 mt-1">
            {rails.map((rail, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-none">
                  {rail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Details (Timeline) */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-2 border-t border-slate-50">
          <div className="bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-100/50">
            <div className="flex flex-col gap-0 relative">
              <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
              {r.ScoredRoute.Route.edgeInfoList.map((edge, eIdx) => (
                <div key={eIdx} className="flex gap-4 items-start relative z-10 py-1.5 group/edge">
                  <div className={`w-[18px] h-[18px] rounded-full border-[4px] mt-1 flex-shrink-0 shadow-sm transition-all duration-300 ${eIdx === 0 || eIdx === r.ScoredRoute.Route.edgeInfoList.length - 1 ? 'bg-white border-slate-800' : 'bg-white border-slate-300'}`} />
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className={`font-bold text-sm sm:text-base tracking-tight ${eIdx === 0 || eIdx === r.ScoredRoute.Route.edgeInfoList.length - 1 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {edge.stationName}
                      </p>
                      {edge.timeInfo && edge.timeInfo.length > 0 && (
                        <div className="flex gap-1 items-center">
                          {edge.timeInfo.map((ti, tIdx) => {
                            let label = ti.type === 1 || (ti.type === 3 && eIdx === 0) ? "発" : "着";
                            let colorClasses = label === "発" 
                              ? "bg-emerald-50/80 text-emerald-700 border-emerald-100/50" 
                              : "bg-orange-50/80 text-orange-700 border-orange-100/50";
                            
                            return (
                              <span key={tIdx} className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded border ${colorClasses}`}>
                                {ti.time} <span className="opacity-70 font-medium text-[8px]">{label}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {eIdx < r.ScoredRoute.Route.edgeInfoList.length - 1 && (
                      <div className="mt-1.5 mb-3 px-2 py-1 rounded-lg bg-white border border-slate-100 shadow-sm inline-flex items-center gap-1.5 max-w-fit">
                        <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wide">{edge.railName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
