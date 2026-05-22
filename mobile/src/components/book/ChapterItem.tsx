import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ChapterListItem, ChapterProgressItem } from "../../types"; // ← đổi type

interface Props {
  chapter: ChapterListItem;
  index: number;
  progress?: ChapterProgressItem; // ← đổi từ number sang object
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return "";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function ChapterItem({ chapter, index, progress }: Props) {
  const router = useRouter();
  const isLocked = !chapter.isUnlocked;

  // ── Tính trạng thái từ ChapterProgressItem ──────────────────
  const isDone = !!progress?.isCompleted;
  const percent = isDone
    ? 100
    : progress && chapter.duration
      ? Math.min(
          99,
          Math.round((progress.audioPosition / chapter.duration) * 100),
        )
      : 0;
  const isPartial = percent > 0 && !isDone;

  const handlePress = () => {
    if (isLocked) return;
    router.push({
      pathname: "/chapter/[id]",
      params: {
        id: chapter._id,
        // ✅ Resume đúng vị trí nếu đang nghe dở
        startPosition: progress?.audioPosition
          ? String(progress.audioPosition * 1000)
          : "0",
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.item, isLocked && styles.itemLocked]}
      onPress={handlePress}
      activeOpacity={isLocked ? 1 : 0.75}
    >
      {/* Số chương / icon trạng thái */}
      <View style={[styles.numWrap, isPartial && styles.numWrapPartial]}>
        <Text style={styles.num}>{chapter.chapterNumber ?? index + 1}</Text>
      </View>

      {/* Thông tin */}
      <View style={styles.info}>
        <Text
          style={[styles.title, isLocked && styles.titleLocked]}
          numberOfLines={1}
        >
          {chapter.title}
        </Text>

        <View style={styles.meta}>
          {!!chapter.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color="#999" />
              <Text style={styles.metaText}>
                {formatDuration(chapter.duration)}
              </Text>
            </View>
          )}

          {/* Progress bar nếu đang nghe dở */}
          {isPartial && (
            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressTxt}>{percent}%</Text>
            </View>
          )}

          {/* Label đã xong */}
          {isDone && <Text style={styles.doneText}>Đã nghe xong</Text>}
        </View>
      </View>

      {/* Icon phải */}
      {isLocked ? (
        <Ionicons name="lock-closed-outline" size={18} color="#CCC" />
      ) : (
        <View style={[styles.playBtn, isDone && styles.playBtnDone]}>
          <Ionicons
            name={isDone ? "checkmark" : "play"}
            size={14}
            color={isDone ? "#00B894" : "#FF6B6B"}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemLocked: { opacity: 0.5 },

  numWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F4F5F7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  numWrapPartial: { backgroundColor: "#FFF0F0" }, // Đỏ nhạt = đang dở

  num: { fontSize: 13, fontWeight: "700", color: "#888" },

  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  titleLocked: { color: "#BBB" },

  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11, color: "#999" },

  progressWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F0F0F0",
  },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#FF6B6B" },
  progressTxt: { fontSize: 10, color: "#FF6B6B", fontWeight: "700" },
  doneText: { fontSize: 11, color: "#00B894", fontWeight: "600" },

  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  playBtnDone: { backgroundColor: "#E8FBF5" },
});
