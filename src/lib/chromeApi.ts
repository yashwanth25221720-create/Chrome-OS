import type { Bookmark, SavedTabGroup } from "../types/halo";

function isChrome(): boolean {
  return typeof chrome !== "undefined" && !!chrome.bookmarks;
}

export async function saveCurrentTabsAsGroup(name: string): Promise<SavedTabGroup | null> {
  if (!isChrome() || !chrome.tabs) return null;
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve({
        id: crypto.randomUUID(),
        name,
        tabs: tabs.filter((t) => t.url && t.title).map((t) => ({
          title: t.title!,
          url: t.url!,
          favicon: t.favIconUrl,
        })),
        createdAt: Date.now(),
      });
    });
  });
}

export function openUrl(url: string): void {
  if (isChrome() && chrome.tabs) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank");
  }
}
