import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => Promise<void>;
  isLoading: boolean;
  initialData?: { rating: number; content: string } | null; // Để edit review
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: Props) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (visible) {
      setRating(initialData?.rating ?? 5);
      setContent(initialData?.content ?? "");
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit(rating, content.trim());
  };

  const labels = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={26} color="#999" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {initialData ? "Sửa đánh giá" : "Viết đánh giá"}
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Text
                  style={[styles.send, !content.trim() && styles.sendDisabled]}
                >
                  Gửi
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Stars */}
          <Text style={styles.prompt}>Bạn thấy cuốn sách này thế nào?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons
                  name={s <= rating ? "star" : "star-outline"}
                  size={38}
                  color={s <= rating ? "#F6AD55" : "#DDD"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{labels[rating - 1]}</Text>

          {/* Text input */}
          <TextInput
            style={styles.input}
            placeholder="Chia sẻ cảm nhận về nội dung và giọng đọc..."
            placeholderTextColor="#BBB"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  send: { fontSize: 16, color: "#FF6B6B", fontWeight: "700" },
  sendDisabled: { color: "#CCC" },

  prompt: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  ratingLabel: {
    textAlign: "center",
    fontSize: 14,
    color: "#F6AD55",
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#333",
    minHeight: 120,
    marginBottom: 6,
  },
  charCount: { textAlign: "right", fontSize: 12, color: "#CCC" },
});
