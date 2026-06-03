import type { HaloState, ViewKey } from "../types/halo";

export interface SearchResult {
  id: string; title: string; subtitle?: string; icon: string; type: "bookmark" | "note" | "task" | "workspace" | "tabgroup" | "ai";
  action: () => void;
}

export function buildSearchResults(query: string, state: HaloState, navigate: (view: ViewKey) => void, openUrl: (url: string) => void): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const bm of state.bookmarks) {
    if (bm.title.toLowerCase().includes(q) || bm.url.toLowerCase().includes(q)) {
      results.push({
        id: `bm-${bm.id}`, title: bm.title, subtitle: bm.url, icon: "🔖", type: "bookmark",
        action: () => openUrl(bm.url),
      });
    }
  }

  for (const note of state.notes) {
    if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
      results.push({
        id: `note-${note.id}`, title: note.title, subtitle: note.content.slice(0, 60), icon: "📝", type: "note",
        action: () => navigate("notes"),
      });
    }
  }

  return results.slice(0, 12);
}
