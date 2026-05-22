import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { useBookStore } from "../../src/stores/useBookStore";
import { useCategoryStore } from "../../src/stores/useCategoryStore";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { Book, Category } from "../../src/types";

import HomeHeader from "../../src/components/home/HomeHeader";
import CategoryList from "../../src/components/home/CategoryList";
import BookSection from "../../src/components/home/BookSection";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import ErrorScreen from "../../src/components/common/ErrorScreen";

export default function HomeScreen() {
  const router = useRouter();

  // ── Stores ──────────────────────────────────────────────────
  const user = useAuthStore((s) => s.user);

  const {
    newBooks,
    topBooks,
    fetchNewBooks,
    fetchTopBooks,
    isLoading: bookLoading,
    error: bookError,
  } = useBookStore();

  const {
    categories,
    fetchCategories,
    isLoading: catLoading,
  } = useCategoryStore();

  // ── Local state ─────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch lần đầu ───────────────────────────────────────────
  const loadData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchNewBooks(10),
      fetchTopBooks("listen", 10),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Pull to refresh ─────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ── Handlers ────────────────────────────────────────────────
  const handlePressBook = (book: Book) => {
    router.push(`/book/${book._id}`);
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat._id === selectedCategory ? undefined : cat._id);
    router.push({
      pathname: "/book-list",
      params: {
        title: cat.name,
        category: cat._id,
      },
    });
  };

  // const handleSeeAllNew = () =>
  //   router.push({
  //     pathname: "/book-list",
  //     params: {
  //       title: "Mới nhất",
  //       sort: "newest",
  //     },
  //   });

  // ── Reset category khi quay lại màn hình ────────────────────
  useFocusEffect(
    React.useCallback(() => {
      setSelectedCategory(undefined);
    }, []),
  );

  const handleSeeAllTop = () =>
    router.push({
      pathname: "/book-list",
      params: {
        title: "Nghe nhiều nhất",
        sort: "top-listen",
      },
    });

  // ── Loading / Error ─────────────────────────────────────────
  if ((bookLoading || catLoading) && newBooks.length === 0) {
    return <LoadingScreen message="Đang tải thư viện sách..." />;
  }

  if (bookError && newBooks.length === 0) {
    return <ErrorScreen message={bookError} onRetry={loadData} />;
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6B6B"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header chào user */}
        <HomeHeader
          userName={user?.name}
          onNotificationPress={() => {
            /* Sau này thêm notification */
          }}
        />

        {/* Thể loại */}
        {categories.length > 0 && (
          <CategoryList
            categories={categories}
            selectedId={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {/* Sách mới */}
        <BookSection
          title="MỚI CẬP NHẬT"
          books={newBooks}
          onPressBook={handlePressBook}
          // onSeeAll={handleSeeAllNew}
        />

        {/* Sách nghe nhiều */}
        <BookSection
          title="SÁCH NGHE NHIỀU"
          books={topBooks}
          onPressBook={handlePressBook}
          onSeeAll={handleSeeAllTop}
        />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomPad: { height: 20 },
});
