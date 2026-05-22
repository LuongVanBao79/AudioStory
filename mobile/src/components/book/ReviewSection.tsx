import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "../../types";

interface Props {
  reviews: Review[];
  isLoading: boolean;
  hasReviewed: boolean;
  onOpenModal: () => void;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name="star"
          size={12}
          color={s <= rating ? "#F6AD55" : "#E9ECEF"}
        />
      ))}
    </View>
  );
}

export default function ReviewSection({
  reviews,
  isLoading,
  hasReviewed,
  onOpenModal,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Đánh giá & Nhận xét</Text>
          {reviews.length > 0 && (
            <Text style={styles.count}>{reviews.length} đánh giá</Text>
          )}
        </View>

        {/* Chỉ hiện nút nếu chưa review */}
        {!hasReviewed && (
          <TouchableOpacity style={styles.writeBtn} onPress={onOpenModal}>
            <Ionicons name="create-outline" size={16} color="#FF6B6B" />
            <Text style={styles.writeBtnText}>Viết đánh giá</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {isLoading ? (
        <ActivityIndicator color="#FF6B6B" style={{ marginTop: 20 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={40} color="#E9ECEF" />
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
          <Text style={styles.emptyHint}>Hãy là người đầu tiên nhận xét!</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review._id} style={styles.reviewItem}>
            {/* Avatar + tên */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {review.user.username?.charAt(0)?.toUpperCase() ?? "U"}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{review.user.username}</Text>
                <StarRow rating={review.rating} />
              </View>
              <Text style={styles.date}>
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            <Text style={styles.content}>{review.content}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 8,
    borderTopColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#1A1A2E" },
  count: { fontSize: 13, color: "#999", marginTop: 3 },

  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  writeBtnText: { color: "#FF6B6B", fontWeight: "700", fontSize: 13 },

  empty: { alignItems: "center", paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#CCC" },
  emptyHint: { fontSize: 13, color: "#DDD" },

  reviewItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 14, fontWeight: "700", color: "#1A1A2E" },
  date: { fontSize: 11, color: "#BBB" },
  content: { fontSize: 14, color: "#555", lineHeight: 22 },
});
