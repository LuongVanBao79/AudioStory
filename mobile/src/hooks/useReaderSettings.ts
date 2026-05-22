// src/hooks/useReaderSettings.ts
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeKey } from "../constants/theme";
import { FontFamily } from "../components/reader/ReaderSettingsModal";

const STORAGE_KEY = "reader_settings";

interface ReaderSettings {
  theme: ThemeKey;
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "sepia",
  fontSize: 20,
  lineHeight: 1.8,
  fontFamily: "System",
};

export function useReaderSettings() {
  const [theme, setThemeState] = useState<ThemeKey>(DEFAULT_SETTINGS.theme);
  const [fontSize, setFontSizeState] = useState(DEFAULT_SETTINGS.fontSize);
  const [lineHeight, setLineHeightState] = useState(
    DEFAULT_SETTINGS.lineHeight,
  );
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(
    DEFAULT_SETTINGS.fontFamily,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load khi mount ──────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved: ReaderSettings = JSON.parse(raw);
          if (saved.theme) setThemeState(saved.theme);
          if (saved.fontSize) setFontSizeState(saved.fontSize);
          if (saved.lineHeight) setLineHeightState(saved.lineHeight);
          if (saved.fontFamily) setFontFamilyState(saved.fontFamily);
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  // ── Save helper ─────────────────────────────────────────────
  const persist = (patch: Partial<ReaderSettings>) => {
    const next: ReaderSettings = {
      theme,
      fontSize,
      lineHeight,
      fontFamily,
      ...patch,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // ── Setters tự động lưu ─────────────────────────────────────
  const setTheme = (val: ThemeKey) => {
    setThemeState(val);
    persist({ theme: val });
  };

  const setFontSize = (val: number) => {
    setFontSizeState(val);
    persist({ fontSize: val });
  };

  const setLineHeight = (val: number) => {
    setLineHeightState(val);
    persist({ lineHeight: val });
  };

  const setFontFamily = (val: FontFamily) => {
    setFontFamilyState(val);
    persist({ fontFamily: val });
  };

  return {
    isLoaded,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
  };
}
