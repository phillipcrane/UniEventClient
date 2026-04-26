import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { STORAGE_KEY_THEME, THEME_DARK, THEME_LIGHT } from '../constants';
import '../styles/ThemeToggle.css';

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY_THEME);
      if (storedTheme === THEME_DARK) return true;
      if (storedTheme === THEME_LIGHT) return false;
    } catch {
      // Ignore storage access issues and fall back to default theme.
    }

    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add(THEME_DARK);
    else root.classList.remove(THEME_DARK);

    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, dark ? THEME_DARK : THEME_LIGHT);
    } catch {
      // Ignore storage access issues and keep runtime theme in memory.
    }
  }, [dark]);

  return (
    <label className="theme-slider">
      <input
        type="checkbox"
        checked={dark}
        onChange={() => setDark(d => !d)}
        aria-label="Toggle dark mode"
      />
      <span className="track">
        <span className="thumb">
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </span>
      </span>
    </label>
  );
}