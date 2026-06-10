// src/components/reader/ReaderSettingsModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { THEMES, ThemeKey } from "../../constants/theme";

// ─────────────────────────────────────────────────────────────
// Danh sách font hỗ trợ
// ─────────────────────────────────────────────────────────────
export type FontFamily =
  | "Arimo"
  | "Bitter"
  | "Andada Pro"
  | "Lora"
  | "Noto Sans"
  | "Lato"
  | "EB Garamond"
  | "Tinos"
  | "Nunito"
  | "System";

export const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
  { label: "Arial", value: "Arimo" }, // thay Arial
  { label: "Charter", value: "Bitter" }, // thay Charter
  { label: "Andada", value: "Andada Pro" }, // giữ nguyên
  { label: "Georgia", value: "Lora" }, // thay Georgia
  { label: "Noto Sans", value: "Noto Sans" }, // giữ nguyên
  { label: "Lato", value: "Lato" }, // giữ nguyên
  { label: "Palatino", value: "EB Garamond" }, // thay Palatino
  { label: "Times NR", value: "Tinos" }, // thay Times New Roman
  { label: "Avenir", value: "Nunito" }, // thay Avenir Next
  { label: "Mặc định", value: "System" }, // giữ nguyên
];

// ─────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

export default function ReaderSettingsModal({
  visible,
  onClose,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  fontFamily,
  setFontFamily,
}: Props) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#FFF" : "#333";
  const bgColor = isDark ? "#222" : "#FFF";
  const labelColor = isDark ? "#AAA" : "#999";

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.settingsContainer, { backgroundColor: bgColor }]}>
          {/* ── Cỡ chữ ── */}
          <View style={styles.settingRow}>
            <Text style={[styles.label, { color: textColor }]}>Cỡ chữ</Text>
            <View style={styles.settingControls}>
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionText, { fontSize: 13 }]}>A−</Text>
              </TouchableOpacity>
              <Text style={[styles.sizeValue, { color: textColor }]}>
                {fontSize}
              </Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionText, { fontSize: 16 }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Giãn dòng ── */}
          <View style={styles.settingRow}>
            <Text style={[styles.label, { color: textColor }]}>Giãn dòng</Text>
            <View style={styles.settingControls}>
              {(
                [
                  { label: "Thấp", value: 1.5 },
                  { label: "Vừa", value: 1.8 },
                  { label: "Cao", value: 2.2 },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setLineHeight(opt.value)}
                  style={[
                    styles.actionBtn,
                    lineHeight === opt.value && styles.actionBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      lineHeight === opt.value && styles.actionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Màu nền ── */}
          <View style={styles.settingRow}>
            <Text style={[styles.label, { color: textColor }]}>Màu nền</Text>
            <View style={styles.settingControls}>
              {(Object.keys(THEMES) as Array<ThemeKey>).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setTheme(key)}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: THEMES[key].background,
                      borderColor: theme === key ? "#FF6B6B" : "#CCC",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Font chữ ── */}
          <View style={styles.fontSection}>
            <Text
              style={[styles.label, { color: textColor, marginBottom: 12 }]}
            >
              Font chữ
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fontList}
            >
              {FONT_OPTIONS.map((opt) => {
                const isActive = fontFamily === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setFontFamily(opt.value)}
                    style={[
                      styles.fontBtn,
                      { borderColor: isDark ? "#444" : "#E0E0E0" },
                      isActive && styles.fontBtnActive,
                    ]}
                  >
                    {/* Preview chữ "Aa" bằng chính font đó */}
                    <Text
                      style={[
                        styles.fontPreview,
                        {
                          fontFamily:
                            opt.value === "System" ? undefined : opt.value,
                          color: isActive ? "#FF6B6B" : textColor,
                        },
                      ]}
                    >
                      Aa
                    </Text>
                    <Text
                      style={[
                        styles.fontLabel,
                        {
                          color: isActive ? "#FF6B6B" : labelColor,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  settingsContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  label: { fontSize: 15, fontWeight: "600" },
  settingControls: { flexDirection: "row", alignItems: "center", gap: 8 },

  actionBtn: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  actionBtnActive: { borderColor: "#FF6B6B" },
  actionText: { color: "#888", fontWeight: "700" },
  actionTextActive: { color: "#FF6B6B" },
  sizeValue: {
    fontSize: 18,
    width: 30,
    textAlign: "center",
    fontWeight: "600",
  },

  themeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2 },

  // Font section
  fontSection: { marginTop: 8, marginBottom: 4 },
  fontList: { gap: 10, paddingBottom: 4 },
  fontBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 68,
    gap: 4,
  },
  fontBtnActive: { borderColor: "#FF6B6B", backgroundColor: "#FF6B6B10" },
  fontPreview: { fontSize: 20, fontWeight: "600" },
  fontLabel: { fontSize: 10, fontWeight: "500" },
});
