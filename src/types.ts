export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'preview' | 'code' | 'split';

export interface HistoryStep {
  url: string;
  title: string;
  html: string;
  prompt: string;
}

export interface Tab {
  id: string;
  title: string;
  url: string;
  prompt: string;
  htmlCode: string;
  isLoading: boolean;
  loadingProgress: number;
  loadingStatus: string;
  deviceMode: DeviceMode;
  viewMode: ViewMode;
  history: HistoryStep[];
  historyIndex: number;
  isBookmarked: boolean;
  favIcon?: string;
}

export interface Preset {
  id: string;
  title: string;
  url: string;
  description: string;
  prompt: string;
  category: 'saas' | 'apple' | 'portfolio' | 'dashboard' | 'business' | 'game';
  icon: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  prompt: string;
  timestamp: string;
  html: string;
}
