const STORAGE_KEY = 'whichway_form';

export interface SavedFormValues {
  from: string;
  to: string;
  preferredLines: string[];
  viaPatterns: string[];
}

export function saveFormValues(values: SavedFormValues): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // localStorage が使えない環境では無視
  }
}

export function loadFormValues(): SavedFormValues | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as SavedFormValues;
  } catch {
    return null;
  }
}
