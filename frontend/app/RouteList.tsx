import RouteResults from './RouteResults';
import { UniqueRoute, ApiResponse } from './types';

interface Props {
  from: string;
  to: string;
  preferredLines?: string | string[];
  viaPatterns?: string | string[];
}

const toArray = (value: string | string[] | undefined): string[] =>
  value ? (Array.isArray(value) ? value : [value]) : [];

export default async function RouteList({ from, to, preferredLines, viaPatterns }: Props) {
  const preferredLineValues = toArray(preferredLines);
  const viaPatternValues = toArray(viaPatterns);
  let routes: UniqueRoute[] = [];
  let error: string | null = null;

  try {
    const params = new URLSearchParams({ from, to });
    preferredLineValues.forEach((value) => params.append('preferred_lines', value));
    viaPatternValues.forEach((value) => params.append('via_patterns', value));
    const res = await fetch(`${process.env.API_BASE_URL}/api/routes?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('ルートの取得に失敗しました');
    const data: ApiResponse = await res.json();
    routes = data.routes ?? [];
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'ルートの取得に失敗しました';
  }

  return (
    <RouteResults
      routes={routes}
      error={error}
      from={from}
      to={to}
      preferredLines={preferredLineValues}
      viaPatterns={viaPatternValues}
    />
  );
}
