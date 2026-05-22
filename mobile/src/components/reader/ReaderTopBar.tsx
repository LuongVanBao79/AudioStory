import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEMES, ThemeKey } from "../../constants/theme";

interface Props {
  title?: string;
  chapterNumber?: number;
  theme: ThemeKey;
  onClose: () => void;
  onScrollTop: () => void;
}

export default function ReaderTopBar({
  title,
  chapterNumber,
  theme,
  onClose,
  onScrollTop,
}: Props) {
  const t = THEMES[theme];

  return (
    <View style={[styles.bar, { backgroundColor: t.background }]}>
      <TouchableOpacity
        onPress={onClose}
        style={styles.btn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={26} color={t.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        {chapterNumber && (
          <Text style={[styles.chapter, { color: "#FF6B6B" }]}>
            Chương {chapterNumber}
          </Text>
        )}
        <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onScrollTop}
        style={styles.btn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-up" size={22} color={t.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 44,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  },
  btn: { padding: 8 },
  center: { flex: 1, alignItems: "center" },
  chapter: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  title: { fontSize: 15, fontWeight: "600" },
});
