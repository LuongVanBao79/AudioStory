import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Book } from "../../src/types";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n ?? 0);
}

// ─── LIST VIEW ───────────────────────────────────────────────
export function BookListItem({
  book,
  onPress,
}: {
  book: Book;
  onPress: (b: Book) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.78}
      onPress={() => onPress(book)}
    >
      <Image
        source={{ uri: book.coverImage }}
        style={styles.cover}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <View>
          {book.isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>FULL</Text>
            </View>
          )}
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {book.author?.name ?? "AudioStory"}
          </Text>
          {book.category && (
            <Text style={styles.category}>{book.category.name}</Text>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={12} color="#F6AD55" />
            <Text style={styles.statText}>
              {book.rating?.toFixed(1) ?? "0"}
            </Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="headset-outline" size={12} color="#999" />
            <Text style={styles.statText}>{formatCount(book.listenCount)}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={12} color="#999" />
            <Text style={styles.statText}>
              {formatCount(book.viewCount ?? 0)} đọc
            </Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={12} color="#999" />
            <Text style={styles.statText}>{book.totalChapters} chương</Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );
}

// ─── GRID VIEW (2 per row) ────────────────────────────────────
export function BookGridItem({
  book,
  onPress,
  cardWidth,
}: {
  book: Book;
  onPress: (b: Book) => void;
  cardWidth: number;
}) {
  return (
    <TouchableOpacity
      style={[styles.gridItem, { width: cardWidth }]}
      activeOpacity={0.78}
      onPress={() => onPress(book)}
    >
      <View>
        <Image
          source={{ uri: book.coverImage }}
          style={[
            styles.gridCover,
            { width: cardWidth, height: cardWidth * 1.4 },
          ]}
          resizeMode="cover"
        />
        {book.isFull && (
          <View style={styles.gridBadge}>
            <Text style={styles.fullBadgeText}>FULL</Text>
          </View>
        )}
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.gridAuthor} numberOfLines={1}>
          {book.author?.name ?? "AudioStory"}
        </Text>
        <View style={styles.gridStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={11} color="#FF6B6B" />
            <Text
              style={[styles.statText, { color: "#FF6B6B", fontWeight: "600" }]}
            >
              {formatCount(book.viewCount ?? 0)}
            </Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={11} color="#F6AD55" />
            <Text style={styles.statText}>
              {book.rating?.toFixed(1) ?? "0"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── QUICK BROWSE (4 per row) ─────────────────────────────────
export function BookQuickItem({
  book,
  onPress,
  cardWidth,
}: {
  book: Book;
  onPress: (b: Book) => void;
  cardWidth: number;
}) {
  return (
    <TouchableOpacity
      style={{ width: cardWidth, marginBottom: 8 }}
      activeOpacity={0.78}
      onPress={() => onPress(book)}
    >
      <Image
        source={{ uri: book.coverImage }}
        style={{
          width: cardWidth,
          height: cardWidth * 1.45,
          borderRadius: 8,
          backgroundColor: "#F0F0F0",
        }}
        resizeMode="cover"
      />
      {book.isFull && (
        <View style={[styles.gridBadge, { top: 4, left: 4 }]}>
          <Text style={styles.fullBadgeText}>FULL</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // List
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cover: {
    width: 64,
    height: 96,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
    minHeight: 96,
  },
  fullBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  fullBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  title: { fontSize: 14, fontWeight: "700", color: "#1A1A2E", lineHeight: 20 },
  author: { fontSize: 12, color: "#999", marginTop: 3 },
  category: { fontSize: 11, color: "#FF6B6B", fontWeight: "600", marginTop: 4 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 11, color: "#888" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#DDD" },

  // Grid
  gridItem: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  gridCover: { backgroundColor: "#F0F0F0" },
  gridBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridInfo: { padding: 10 },
  gridTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 18,
  },
  gridAuthor: { fontSize: 11, color: "#999", marginTop: 3, marginBottom: 6 },
  gridStats: { flexDirection: "row", alignItems: "center", gap: 6 },
});
