import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Book } from "../../types";

interface Props {
  book: Book;
  onPress: (book: Book) => void;
}

export default function BookCard({ book, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress(book)}
    >
      {/* Ảnh bìa */}
      <View style={styles.coverWrapper}>
        <Image
          source={
            book.coverImage
              ? { uri: book.coverImage }
              : require("../../../assets/images/android-icon-background.png")
          }
          style={styles.cover}
          resizeMode="cover"
        />
        {/* Badge hoàn thành */}
        {book.isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>FULL</Text>
          </View>
        )}
      </View>

      {/* Thông tin */}
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {book.author?.name ?? "AudioStory"}
      </Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={11} color="#F6AD55" />
          <Text style={styles.statText}>{book.rating?.toFixed(1) ?? "0"}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={11} color="#888" />
          <Text style={styles.statText}>
            {(book.viewCount ?? 0) >= 1000
              ? `${((book.viewCount ?? 0) / 1000).toFixed(1)}k`
              : (book.viewCount ?? 0)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.statItem}>
          <Ionicons name="headset-outline" size={11} color="#888" />
          <Text style={styles.statText}>
            {(book.listenCount ?? 0) >= 1000
              ? `${((book.listenCount ?? 0) / 1000).toFixed(1)}k`
              : (book.listenCount ?? 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    marginRight: 14,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  coverWrapper: {
    width: "100%",
    height: 190,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    position: "relative",
  },
  cover: { width: "100%", height: "100%" },
  fullBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fullBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
    marginTop: 10,
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: "#999",
    marginTop: 3,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 11, color: "#888", fontWeight: "500" },
  separator: {
    width: 1,
    height: 15,
    backgroundColor: "#E0E0E0",
  },
});
