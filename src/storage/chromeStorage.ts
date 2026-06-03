import type { HaloState } from "../types/halo";
import { defaultState } from "./defaultState";

const STORAGE_KEY = "halo_os_state";

function isChrome(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage;
}

export async function loadState(): Promise<HaloState> {
  if (isChrome()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        const stored = result[STORAGE_KEY];
        if (!stored) return resolve(defaultState);
        const merged = { ...defaultState, ...stored };
        merged.widgets = mergeWidgets(defaultState.widgets, stored.widgets);
        resolve(merged);
      });
    });
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const stored = JSON.parse(raw);
    const merged = { ...defaultState, ...stored };
    merged.widgets = mergeWidgets(defaultState.widgets, stored.widgets);
    return merged;
  } catch {
    return defaultState;
  }
}

function mergeWidgets(defaults: typeof defaultState.widgets, stored: any) {
  if (!stored) return defaults;
  const defaultIds = new Set(defaults.map((w) => w.id));
  const storedMap = new Map(stored.map((w: any) => [w.id, w]));
  return defaults.map((w) => storedMap.get(w.id) || w);
}

export async function saveState(state: HaloState): Promise<void> {
  if (isChrome()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: state }, resolve);
    });
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode
  }
}
