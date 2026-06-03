export type ViewKey = "home" | "bookmarks" | "notes" | "tasks" | "tabgroups" | "ai" | "workspaces" | "settings" | "adblocker";
export type NoteType = "quick" | "markdown" | "website";
export type WidgetId = "clock" | "greeting" | "search" | "quicklinks" | "tasks" | "notes" | "weather" | "pomodoro" | "aiproviders";

export interface Note { id: string; title: string; content: string; type: NoteType; url?: string; createdAt: number; updatedAt: number; }
export interface Task { id: string; title: string; done: boolean; dueDate?: string; priority: "low" | "medium" | "high"; category: string; createdAt: number; }
export interface Bookmark { id: string; title: string; url: string; favicon?: string; favorite: boolean; folderId?: string; createdAt: number; }
export interface BookmarkFolder { id: string; title: string; parentId?: string; }
export interface SavedTabGroup { id: string; name: string; color?: string; tabs: { title: string; url: string; favicon?: string }[]; createdAt: number; }
export interface Workspace { id: string; name: string; icon: string; color: string; createdAt: number; }
export interface AIProvider { id: string; name: string; icon: string; url: string; color: string; queryTemplate?: string; custom?: boolean; }
export interface Widget { id: WidgetId; visible: boolean; order: number; }
export interface WeatherData { temp: number; condition: string; icon: string; city: string; fetchedAt: number; }
export interface PomodoroSettings { workMinutes: number; breakMinutes: number; }
export interface HaloState {
  activeView: ViewKey; sidebarCollapsed: boolean; theme: "dark" | "light"; wallpaper: string;
  notes: Note[]; tasks: Task[]; bookmarks: Bookmark[]; bookmarkFolders: BookmarkFolder[];
  savedTabGroups: SavedTabGroup[]; workspaces: Workspace[]; activeWorkspaceId: string;
  aiProviders: AIProvider[]; widgets: Widget[]; weatherData?: WeatherData;
  weatherCity: string; pomodoroSettings: PomodoroSettings;
  adblockEnabled: boolean; adblockFilterLists: string[]; customCSS: string;
}
