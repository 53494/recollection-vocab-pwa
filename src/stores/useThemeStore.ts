import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

export interface AccentPreset {
  name: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: '经典黑', hex: '#1A1A1A' },
  { name: '墨绿', hex: '#0F766E' },
  { name: '靛蓝', hex: '#4338CA' },
  { name: '酒红', hex: '#BE123C' },
  { name: '琥珀', hex: '#D97706' },
  { name: '石墨', hex: '#374151' },
  { name: '粉色', hex: '#DB2777' },
];

export const SPLASH_PRESETS: AccentPreset[] = [
  { name: '深灰', hex: '#1E1E1E' },
  { name: '纯黑', hex: '#0A0A0A' },
  { name: '墨绿', hex: '#064E3B' },
  { name: '藏青', hex: '#1E3A5F' },
  { name: '暗紫', hex: '#2D1B4E' },
  { name: '柔粉', hex: '#4A1030' },
  { name: '粉色', hex: '#9D174D' },
];

interface ThemeState {
  mode: ThemeMode;
  accentColor: string;
  splashColor: string;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setSplashColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: (localStorage.getItem('recollection_mode') as ThemeMode) || 'light',
  accentColor: localStorage.getItem('recollection_accentColor') || '#1A1A1A',
  splashColor: localStorage.getItem('recollection_splashColor') || '#1E1E1E',

  setMode: (mode) => {
    localStorage.setItem('recollection_mode', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    set({ mode });
  },
  setAccentColor: (color) => {
    localStorage.setItem('recollection_accentColor', color);
    set({ accentColor: color });
  },
  setSplashColor: (color) => {
    localStorage.setItem('recollection_splashColor', color);
    set({ splashColor: color });
  },
}));
