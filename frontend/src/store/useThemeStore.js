import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('videomate-theme') || 'nord',
  setTheme: (theme) => {
    localStorage.setItem('videomate-theme',theme);
    set({theme})
  }
}))