import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useBookStore } from "../../src/stores/useBookStore";
import { useFavoriteStore } from "../../src/stores/useFavoriteStore";
import { useReviewStore } from "../../src/stores/useReviewStore";
import { useChapterStore } from "../../src/stores/useChapterStore";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useRequireAuth } from "../../src/hooks/useRequireAuth";
import { ChapterProgressItem } from "../../src/types"; // ← thêm

import BookInfo from "../../src/components/book/BookInfo";
import ChapterItem from "../../src/components/book/ChapterItem";
import ReviewSection from "../../src/components/book/ReviewSection";
import ReviewModal from "../../src/components/book/ReviewModal";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { requireAuth } = useRequireAuth();

  // ── Stores ──────────────────────────────────────────────────
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const {
    selectedBook,
    isLoading: bookLoading,
    error: bookError,
    fetchBookById,
    incrementView,
  } = useBookStore();

  const { isFavorite, checkFavorite, toggleFavorite } = useFavoriteStore();

  const {
    reviews,
    hasReviewed,
    isLoading: reviewLoading,
    fetchReviews,
    fetchMyReview,
    createReview,
    updateReview,
    myReview,
  } = useReviewStore();

  const {
    progress,
    fetchProgress,
    chapterProgressMap, // ← thêm
    fetchChapterProgressByBook, // ← thêm
  } = useChapterStore();

  const [showModal, setShowModal] = React.useState(false);

  // ── Fetch mỗi khi màn được focus ────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      fetchBookById(id);
      fetchReviews(id);
      incrementView(id);

      if (isLoggedIn) {
        checkFavorite(id);
        fetchMyReview(id);
        fetchProgress(id);
        fetchChapterProgressByBook(id); // ← thêm
      }

      return () => {
        useReviewStore.getState().clearReviews();
      };
    }, [id, isLoggedIn]),
  );

  // ── Handlers ────────────────────────────────────────────────
  const handlePlayFirst = useCallback(() => {
    if (!selectedBook?.chapters?.length) return;
    router.push({
      pathname: "/chapter/[id]",
      params: { id: selectedBook.chapters[0]._id },
    });
  }, [selectedBook]);

  const handleContinue = useCallback(() => {
    if (!progress?.chapter) return;
    router.push({
      pathname: "/chapter/[id]",
      params: {
        id: progress.chapter._id,
        startPosition: String((progress.audioPosition ?? 0) * 1000),
      },
    });
  }, [progress]);

  const handleToggleFav = () => {
    requireAuth(() =>
      toggleFavorite(id!, (isFav: boolean) => {
        Alert.alert(
          isFav ? "❤️ Đã thêm vào yêu thích" : "💔 Đã bỏ khỏi yêu thích",
          isFav
            ? "Bạn có thể xem lại trong Tủ sách"
            : "Đã xoá khỏi danh sách yêu thích",
          [{ text: "OK" }],
        );
      }),
    );
  };

  const handleAuthorPress = (authorId: string) => {
    router.push({ pathname: "/author/[id]", params: { id: authorId } });
  };

  const handleOpenReview = () => {
    requireAuth(() => setShowModal(true));
  };

  const handleSubmitReview = async (rating: number, content: string) => {
    if (hasReviewed && myReview) {
      await updateReview(myReview._id, { rating, content });
    } else {
      await createReview({ book: id!, rating, content });
    }
    setShowModal(false);
    fetchReviews(id!);
  };

  // ✅ Trả về ChapterProgressItem thay vì number
  const getChapterProgress = (
    chapterId: string,
  ): ChapterProgressItem | undefined => {
    return chapterProgressMap[chapterId] ?? undefined;
  };

  // ── States ───────────────────────────────────────────────────
  if (bookLoading && !selectedBook) {
    return <LoadingScreen message="Đang tải thông tin sách..." />;
  }
  if (bookError || !selectedBook) {
    return (
      <ErrorScreen
        message={bookError ?? "Không tìm thấy sách"}
        onRetry={() => fetchBookById(id!)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedBook.title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <BookInfo
          book={selectedBook}
          isFavorite={isFavorite(id!)}
          progress={isLoggedIn ? progress : null}
          onPlay={handlePlayFirst}
          onContinue={handleContinue}
          onToggleFav={handleToggleFav}
          onAuthorPress={handleAuthorPress}
        />

        {/* Danh sách chương */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách chương</Text>
            <Text style={styles.chapterCount}>
              {selectedBook.chapters?.length ?? 0} chương
            </Text>
          </View>

          {selectedBook.chapters?.length > 0 ? (
            selectedBook.chapters.map((ch, i) => (
              <ChapterItem
                key={ch._id}
                chapter={ch}
                index={i}
                // ✅ Truyền ChapterProgressItem — undefined nếu chưa login
                progress={isLoggedIn ? getChapterProgress(ch._id) : undefined}
              />
            ))
          ) : (
            <View style={styles.emptyChapter}>
              <Ionicons
                name="musical-notes-outline"
                size={40}
                color="#E9ECEF"
              />
              <Text style={styles.emptyText}>Đang cập nhật nội dung...</Text>
            </View>
          )}
        </View>

        <ReviewSection
          reviews={reviews}
          isLoading={reviewLoading}
          hasReviewed={hasReviewed}
          onOpenModal={handleOpenReview}
        />
      </ScrollView>

      <ReviewModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitReview}
        isLoading={reviewLoading}
        initialData={
          hasReviewed && myReview
            ? { rating: myReview.rating, content: myReview.content }
            : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 36, alignItems: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  section: { padding: 20, borderTopWidth: 8, borderTopColor: "#F8F9FA" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A2E" },
  chapterCount: { fontSize: 13, color: "#999" },
  emptyChapter: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyText: { color: "#CCC", fontStyle: "italic" },
});
