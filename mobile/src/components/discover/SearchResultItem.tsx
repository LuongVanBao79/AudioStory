import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Book } from "../../types";

interface Props {
  book: Book;
  onPress: (book: Book) => void;
}

export default function SearchResultItem({ book, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.75}
      onPress={() => onPress(book)}
    >
      {/* Ảnh bìa */}
      <Image
        source={{ uri: book.coverImage }}
        style={styles.cover}
        resizeMode="cover"
      />

      {/* Thông tin */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author?.name ?? "AudioStory"}
        </Text>

        {/* Category badge */}
        {book.category && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{book.category.name}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <Ionicons name="star" size={12} color="#F6AD55" />
          <Text style={styles.statText}>{book.rating?.toFixed(1) ?? "0"}</Text>

          <View style={styles.dot} />

          <Ionicons name="headset-outline" size={12} color="#999" />
          <Text style={styles.statText}>
            {book.listenCount >= 1000
              ? `${(book.listenCount / 1000).toFixed(1)}k`
              : book.listenCount}
          </Text>

          <View style={styles.dot} />

          <Text style={styles.statText}>{book.totalChapters} chương</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cover: {
    width: 58,
    height: 86,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  info: { flex: 1, marginLeft: 14, gap: 4 },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 20,
  },
  author: { fontSize: 12, color: "#999" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, color: "#FF6B6B", fontWeight: "600" },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statText: { fontSize: 11, color: "#888" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },
});
