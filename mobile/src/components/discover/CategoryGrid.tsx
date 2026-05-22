import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types";

// Icon + màu theo từng thể loại — fallback nếu không match
const CATEGORY_THEMES: Record<string, { color: string; icon: string }> = {
  default: { color: "#FF6B6B", icon: "library" },
  "tiểu thuyết": { color: "#6C63FF", icon: "book" },
  "trinh thám": { color: "#2D3436", icon: "search" },
  "kinh dị": { color: "#D63031", icon: "skull" },
  "lãng mạn": { color: "#E84393", icon: "heart" },
  "cổ điển": { color: "#8B6914", icon: "time" },
  "khoa học": { color: "#0984E3", icon: "flask" },
  "phiêu lưu": { color: "#00B894", icon: "compass" },
  "lịch sử": { color: "#6D4C41", icon: "earth" },
  "thiếu nhi": { color: "#FDCB6E", icon: "happy" },
  "tâm lý": { color: "#A29BFE", icon: "brain" },
  "self-help": { color: "#55EFC4", icon: "star" },
};

const FALLBACK_COLORS = [
  "#FF6B6B",
  "#6C63FF",
  "#00B894",
  "#FDCB6E",
  "#E84393",
  "#0984E3",
  "#6D4C41",
  "#A29BFE",
];

const getTheme = (name: string, index: number) => {
  const key = Object.keys(CATEGORY_THEMES).find((k) =>
    name.toLowerCase().includes(k),
  );
  if (key) return CATEGORY_THEMES[key];
  return {
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    icon: "library",
  };
};

interface Props {
  categories: Category[];
  onPress: (category: Category) => void;
}

export default function CategoryGrid({ categories, onPress }: Props) {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>Duyệt theo thể loại</Text>
      }
      renderItem={({ item, index }) => {
        const theme = getTheme(item.name, index);
        return (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.color }]}
            activeOpacity={0.82}
            onPress={() => onPress(item)}
          >
            {/* Icon nền mờ */}
            <Ionicons
              name={theme.icon as any}
              size={52}
              color="rgba(255,255,255,0.18)"
              style={styles.bgIcon}
            />
            {/* Số sách */}
            <Text style={styles.bookCount}>
              {(item as any).bookCount ? `${(item as any).bookCount} cuốn` : ""}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },
  row: { justifyContent: "space-between" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    width: "48%",
    height: 110,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bgIcon: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  bookCount: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    lineHeight: 20,
  },
});
