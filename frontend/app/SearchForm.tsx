'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState, useTransition } from 'react';
import { loadFormValues, saveFormValues } from './lib/formStorage';

interface TagInputProps {
  id: string;
  placeholder: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
}

function TagInput({ id, placeholder, tags, onAdd, onRemove }: TagInputProps) {
  const [input, setInput] = useState('');
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDup = (word: string) => {
    setDupWarning(word);
    if (dupTimerRef.current) clearTimeout(dupTimerRef.current);
    dupTimerRef.current = setTimeout(() => setDupWarning(null), 2000);
  };

  const commit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      showDup(trimmed);
      setInput('');
      return;
    }
    onAdd(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      commit();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  };

  return (
    <>
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white min-h-[42px] cursor-text focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            className="text-blue-400 hover:text-blue-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={tags.length === 0 ? placeholder : '追加...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-slate-800 placeholder:text-slate-300 outline-none"
      />
    </div>
    {dupWarning && (
      <p className="text-xs text-red-400 font-medium px-1 mt-1">
        「{dupWarning}」はすでに追加済みです
      </p>
    )}
  </>
  );
}

// ─── メインフォーム ───────────────────────────────────────────────────
export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');
  const [preferredLines, setPreferredLines] = useState<string[]>(
    searchParams.getAll('preferred_lines')
  );
  const [viaPatterns, setViaPatterns] = useState<string[]>(
    searchParams.getAll('via_patterns')
  );
  const [showAdvanced, setShowAdvanced] = useState(
    !!(searchParams.getAll('preferred_lines').length || searchParams.getAll('via_patterns').length)
  );
  const [isPending, startTransition] = useTransition();
  const [showHelp, setShowHelp] = useState(false);

  // localStorage から復元（searchParams がなければ）
  useEffect(() => {
    const saved = loadFormValues();
    if (!saved) return;
    if (!searchParams.get('from') && saved.from) setFrom(saved.from);
    if (!searchParams.get('to') && saved.to) setTo(saved.to);
    if (!searchParams.getAll('preferred_lines').length && saved.preferredLines.length) {
      setPreferredLines(saved.preferredLines);
      setShowAdvanced(true);
    }
    if (!searchParams.getAll('via_patterns').length && saved.viaPatterns.length) {
      setViaPatterns(saved.viaPatterns);
      setShowAdvanced(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = () => {
    if (!from.trim() || !to.trim()) return;
    saveFormValues({ from: from.trim(), to: to.trim(), preferredLines, viaPatterns });
    const params = new URLSearchParams();
    params.set('from', from.trim());
    params.set('to', to.trim());
    preferredLines.forEach(v => params.append('preferred_lines', v));
    viaPatterns.forEach(v => params.append('via_patterns', v));
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleStationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitSearch();
  };

  const swapStations = () => (setFrom(to), setTo(from));

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full flex flex-col gap-3"
    >
      {/* メイン検索行 */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white rounded-2xl border border-slate-200 shadow-md p-3">
        {/* 出発地 */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="4" strokeWidth={2.5} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
          </svg>
          <input
            id="from-station"
            type="text"
            placeholder="出発地"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onKeyDown={handleStationKeyDown}
            className="flex-1 bg-transparent text-slate-800 font-semibold text-sm placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* 入れ替えボタン */}
        <div className="flex sm:flex items-center justify-center">
          <button
            type="button"
            onClick={swapStations}
            disabled={isPending}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="出発地と目的地を入れ替え"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* 目的地 */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            id="to-station"
            type="text"
            placeholder="目的地"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={handleStationKeyDown}
            className="flex-1 bg-transparent text-slate-800 font-semibold text-sm placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* 検索ボタン */}
        <button
          id="search-button"
          type="button"
          onClick={submitSearch}
          disabled={isPending || !from.trim() || !to.trim()}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:from-blue-500 hover:to-indigo-400 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0"
        >
          {isPending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          )}
          検索
        </button>
      </div>

      {/* 詳細オプション */}
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors px-1"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            詳細オプション
          </button>
          <button
            type="button"
            id="help-button"
            onClick={() => setShowHelp(true)}
            className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all text-xs font-black leading-none"
            aria-label="詳細オプションの説明"
          >
            ?
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-2 flex flex-col sm:flex-row gap-3 bg-slate-50 rounded-xl border border-slate-100 p-4">
            {/* 優先路線 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="preferred-lines" className="text-sm font-bold text-slate-600">
                優先路線
              </label>
              <TagInput
                id="preferred-lines"
                placeholder="例: 中央線"
                tags={preferredLines}
                onAdd={(tag) => setPreferredLines(prev => [...prev, tag])}
                onRemove={(i) => setPreferredLines(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>

            {/* 経由候補 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="via-patterns" className="text-sm font-bold text-slate-600">
                経由候補
              </label>
              <TagInput
                id="via-patterns"
                placeholder="例: 横浜"
                tags={viaPatterns}
                onAdd={(tag) => setViaPatterns(prev => [...prev, tag])}
                onRemove={(i) => setViaPatterns(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>
          </div>
        )}
      </div>

      {/* アルゴリズム説明モーダル */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">スコアリングの仕組み</h2>
                <p className="text-sm text-slate-500 mt-1">WhichWay は複数の要素を独自に計算し、あなたの負担が最も小さいルートを上位に表示します。</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* スコア要素 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-2xl">⏱</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">到着時刻</p>
                  <p className="text-xs text-slate-500 mt-0.5">現在時刻からの到着までの時間が短いほど高評価。長く待つルートは減点されます。</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-2xl">💴</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">料金</p>
                  <p className="text-xs text-slate-500 mt-0.5">運賃が安いほど高評価。割高なルートは減点されます。</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">乗り換え回数</p>
                  <p className="text-xs text-slate-500 mt-0.5">乗り換えが少ないほど高評価。1回の乗り換えは大きく減点されます。</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">優先路線</p>
                  <p className="text-xs text-slate-500 mt-0.5">「優先路線」に設定した路線を使うルートは加点されます。好きな路線や座れる路線を指定しましょう。</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">「経由候補」を設定すると、各経由地を通るルートも並行して検索・比較します。</p>
          </div>
        </div>
      )}
    </form>
  );
}
