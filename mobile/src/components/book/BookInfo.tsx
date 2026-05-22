import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookDetail, ReadingProgress } from "../../types";

interface Props {
  book: BookDetail;
  isFavorite: boolean;
  progress: ReadingProgress | null;
  onPlay: () => void;
  onContinue: () => void;
  onToggleFav: () => void;
  onAuthorPress: (authorId: string) => void;
}

export default function BookInfo({
  book,
  isFavorite,
  progress,
  onPlay,
  onContinue,
  onToggleFav,
  onAuthorPress,
}: Props) {
  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <View style={styles.wrapper}>
      {/* Ảnh bìa */}
      <View style={styles.coverWrap}>
        <Image
          source={{ uri: book.coverImage }}
          style={styles.cover}
          resizeMode="cover"
        />
        {book.isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>FULL</Text>
          </View>
        )}
      </View>

      {/* Tên + Tác giả */}
      <Text style={styles.title}>{book.title}</Text>
      <TouchableOpacity
        onPress={() => book.author?._id && onAuthorPress(book.author._id)}
        activeOpacity={0.7}
        style={styles.authorBtn}
      >
        <Ionicons name="person-outline" size={13} color="#FF6B6B" />
        <Text style={styles.authorName}>
          {book.author?.name ?? "AudioStory"}
        </Text>
        <Ionicons name="chevron-forward" size={13} color="#FF6B6B" />
      </TouchableOpacity>

      {/* Category */}
      {book.category && (
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{book.category.name}</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={14} color="#F6AD55" />
          <Text style={styles.statText}>{book.rating?.toFixed(1) ?? "0"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} color="#888" />
          <Text style={styles.statText}>
            {formatCount(book.viewCount ?? 0)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="headset-outline" size={14} color="#888" />
          <Text style={styles.statText}>
            {formatCount(book.listenCount ?? 0)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={14} color="#888" />
          <Text style={styles.statText}>{book.totalChapters} chương</Text>
        </View>
      </View>

      {/* Mô tả */}
      <Text style={styles.desc}>
        {book.description ?? "Chưa có mô tả cho cuốn sách này."}
      </Text>

      {/* Buttons */}
      <View style={styles.btnRow}>
        {/* Nút chính: Nghe / Tiếp tục */}
        {progress ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
            <Ionicons name="play" size={18} color="#FFF" />
            <View style={styles.continueTxt}>
              <Text style={styles.primaryBtnText}>Tiếp tục nghe</Text>
              <Text style={styles.primaryBtnSub}>
                Chương {progress.chapter?.chapterNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={onPlay}>
            <Ionicons name="play" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>Nghe từ đầu</Text>
          </TouchableOpacity>
        )}

        {/* Nút Yêu thích */}
        <TouchableOpacity
          style={[styles.favBtn, isFavorite && styles.favBtnActive]}
          onPress={onToggleFav}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "#FF6B6B" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", padding: 20, paddingTop: 16 },

  coverWrap: { position: "relative", marginBottom: 18 },
  cover: {
    width: 156,
    height: 230,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  fullBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    textAlign: "center",
    lineHeight: 30,
  },
  authorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    fontStyle: "italic",
  },

  catBadge: {
    backgroundColor: "#EEF2FF", // Xanh tím nhạt
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  catText: { fontSize: 13, color: "#6C63FF", fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 13, color: "#555", fontWeight: "600" },
  divider: { width: 1, height: 16, backgroundColor: "#E0E0E0" },

  desc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "justify",
    marginBottom: 20,
  },

  btnRow: { flexDirection: "row", gap: 12, width: "100%" },

  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  primaryBtnSub: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  continueTxt: { alignItems: "center" },

  favBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  favBtnActive: {
    borderColor: "#FFD0D0",
    backgroundColor: "#FFF0F0",
  },
});
