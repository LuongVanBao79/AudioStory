// src/components/reader/AudioPlayerMini.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { ThemeKey } from "../../constants/theme";

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  theme: ThemeKey;
  position: number;
  duration: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onSlidingStart: () => void;
  onSlidingComplete: (val: number) => void;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

const formatTime = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function AudioPlayerMini({
  theme,
  position,
  duration,
  isPlaying,
  speed,
  onSlidingStart,
  onSlidingComplete,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  onSpeedChange,
}: Props) {
  const isDark = theme === "dark";
  const bg = isDark ? "#2A2A2A" : "#FFF";
  const color = isDark ? "#FFF" : "#333";

  // Cycle sang tốc độ tiếp theo trong danh sách
  const handleCycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    onSpeedChange(SPEED_OPTIONS[nextIndex]);
  };

  const speedLabel = speed === 1 ? "1x" : `${speed}x`;

  return (
    <View style={[styles.wrapper, { backgroundColor: bg }]}>
      {/* Thanh thời gian */}
      <View style={styles.timeRow}>
        <Text style={[styles.time, { color }]}>{formatTime(position)}</Text>
        <Text style={[styles.time, { color: "#999" }]}>
          {formatTime(duration)}
        </Text>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor="#FF6B6B"
        maximumTrackTintColor={isDark ? "#555" : "#E9ECEF"}
        thumbTintColor="#FF6B6B"
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
      />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Tốc độ phát — bấm để cycle */}
        <TouchableOpacity
          onPress={handleCycleSpeed}
          style={[
            styles.speedBtn,
            { borderColor: speed !== 1 ? "#FF6B6B" : isDark ? "#555" : "#DDD" },
          ]}
        >
          <Text
            style={[
              styles.speedText,
              { color: speed !== 1 ? "#FF6B6B" : color },
            ]}
          >
            {speedLabel}
          </Text>
        </TouchableOpacity>

        {/* -15s */}
        <TouchableOpacity onPress={onSkipBackward} style={styles.skipBtn}>
          <Ionicons name="play-back" size={22} color={color} />
          <Text style={[styles.skipLabel, { color }]}>15</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity style={styles.playBtn} onPress={onPlayPause}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={26}
            color="#FFF"
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>

        {/* +15s */}
        <TouchableOpacity onPress={onSkipForward} style={styles.skipBtn}>
          <Text style={[styles.skipLabel, { color }]}>15</Text>
          <Ionicons name="play-forward" size={22} color={color} />
        </TouchableOpacity>

        {/* Placeholder để căn giữa đối xứng với speedBtn */}
        <View style={styles.speedPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  time: { fontSize: 12, fontWeight: "500" },
  slider: { width: "100%", height: 36 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginTop: 4,
  },
  skipBtn: { flexDirection: "row", alignItems: "center", gap: 3 },
  skipLabel: { fontSize: 11, fontWeight: "700" },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  speedBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 44,
    alignItems: "center",
  },
  speedText: { fontSize: 13, fontWeight: "700" },
  speedPlaceholder: { width: 44 }, // Đối xứng với speedBtn
});
