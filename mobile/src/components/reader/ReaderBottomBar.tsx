import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEMES, ThemeKey } from "../../constants/theme";

interface Props {
  theme: ThemeKey;
  showAudioPlayer: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  commentCount?: number; // ← MỚI
  onOpenSettings: () => void;
  onToggleAudio: () => void;
  onOpenToc: () => void;
  onOpenComments: () => void; // ← MỚI
  onPrev: () => void;
  onNext: () => void;
}

export default function ReaderBottomBar({
  theme,
  showAudioPlayer,
  hasPrev,
  hasNext,
  commentCount,
  onOpenSettings,
  onToggleAudio,
  onOpenToc,
  onOpenComments,
  onPrev,
  onNext,
}: Props) {
  const t = THEMES[theme];

  return (
    <View style={[styles.bar, { backgroundColor: t.background }]}>
      {/* Cài đặt chữ */}
      <TouchableOpacity style={styles.btn} onPress={onOpenSettings}>
        <Ionicons name="text" size={22} color={t.text} />
      </TouchableOpacity>

      {/* Chương trước */}
      <TouchableOpacity
        onPress={onPrev}
        disabled={!hasPrev}
        style={[styles.btn, { opacity: hasPrev ? 1 : 0.3 }]}
      >
        <Ionicons name="chevron-back" size={26} color={t.text} />
      </TouchableOpacity>

      {/* Audio */}
      <TouchableOpacity style={styles.btn} onPress={onToggleAudio}>
        <Ionicons
          name="headset"
          size={24}
          color={showAudioPlayer ? "#FF6B6B" : t.text}
        />
      </TouchableOpacity>

      {/* Chương sau */}
      <TouchableOpacity
        onPress={onNext}
        disabled={!hasNext}
        style={[styles.btn, { opacity: hasNext ? 1 : 0.3 }]}
      >
        <Ionicons name="chevron-forward" size={26} color={t.text} />
      </TouchableOpacity>

      {/* Mục lục */}
      <TouchableOpacity style={styles.btn} onPress={onOpenToc}>
        <Ionicons name="list" size={24} color={t.text} />
      </TouchableOpacity>

      {/* ✅ Bình luận */}
      <TouchableOpacity style={styles.btn} onPress={onOpenComments}>
        <View>
          <Ionicons name="chatbubble-outline" size={22} color={t.text} />
          {!!commentCount && commentCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {commentCount > 99 ? "99+" : commentCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
    paddingTop: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  btn: { padding: 8, alignItems: "center", justifyContent: "center" },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
});
