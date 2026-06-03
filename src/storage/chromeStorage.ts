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
        resolve(stored ? { ...defaultState, ...stored } : defaultState);
      });
    });
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
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
