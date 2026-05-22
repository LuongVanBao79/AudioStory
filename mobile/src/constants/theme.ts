export const THEMES = {
  light: { background: "#FFFFFF", text: "#333333", name: "Sáng" },
  sepia: { background: "#F4ECD8", text: "#5B4636", name: "Giấy úa" },
  dark: { background: "#1A1A1A", text: "#CCCCCC", name: "Tối" },
};

export type ThemeKey = keyof typeof THEMES;
