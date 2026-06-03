import type { HaloState, AIProvider, Widget } from "../types/halo";

export const defaultAIProviders: AIProvider[] = [
  { id: "chatgpt", name: "ChatGPT", icon: "🤖", url: "https://chatgpt.com", color: "#10a37f", queryTemplate: "https://chatgpt.com/?q={query}" },
  { id: "claude", name: "Claude", icon: "✦", url: "https://claude.ai", color: "#d97757", queryTemplate: "https://claude.ai/new?q={query}" },
  { id: "gemini", name: "Gemini", icon: "✦", url: "https://gemini.google.com", color: "#4285f4", queryTemplate: "https://gemini.google.com/app?q={query}" },
  { id: "grok", name: "Grok", icon: "𝕏", url: "https://grok.com", color: "#e7e9ea", queryTemplate: "https://grok.com/?q={query}" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍", url: "https://chat.deepseek.com", color: "#4d6bfe", queryTemplate: "https://chat.deepseek.com/?q={query}" },
  { id: "perplexity", name: "Perplexity", icon: "⚡", url: "https://perplexity.ai", color: "#20b2aa", queryTemplate: "https://www.perplexity.ai/?q={query}" },
];

export const defaultWidgets: Widget[] = [
  { id: "clock", visible: true, order: 0 },
  { id: "greeting", visible: true, order: 1 },
  { id: "search", visible: true, order: 2 },
  { id: "quicklinks", visible: true, order: 3 },
  { id: "weather", visible: true, order: 4 },
  { id: "pomodoro", visible: false, order: 5 },
  { id: "tasks", visible: true, order: 6 },
  { id: "notes", visible: false, order: 7 },
  { id: "aiproviders", visible: true, order: 8 },
];

export const defaultState: HaloState = {
  activeView: "home", sidebarCollapsed: false, theme: "dark", wallpaper: "",
  notes: [], tasks: [], bookmarks: [], bookmarkFolders: [], savedTabGroups: [],
  workspaces: [{ id: "default", name: "Personal", icon: "🏠", color: "#3b82f6", createdAt: Date.now() }],
  activeWorkspaceId: "default", aiProviders: defaultAIProviders, widgets: defaultWidgets,
  weatherData: undefined, weatherCity: "", pomodoroSettings: { workMinutes: 25, breakMinutes: 5 },
  adblockEnabled: false, adblockFilterLists: [], customCSS: "",
};
