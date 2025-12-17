export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  sourceUrl?: string;
  sourceTitle?: string;
  tags?: string[];
}

export interface SummaryHistoryItem {
  id: string;
  originalText: string;
  summary: string;
  timestamp: number;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

// App View Mode to simulate Extension environment
export type AppMode = 'popup' | 'sidepanel' | 'options';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}