import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Book } from "../../types";
import BookCard from "./BookCard";

interface Props {
  title: string;
  books: Book[];
  onPressBook: (book: Book) => void;
  onSeeAll?: () => void;
}

export default function BookSection({ title, books, onPressBook }: Props) {
  if (books.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {/* Danh sách */}
      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={onPressBook} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 28 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FF6B6B",
  },
  title: { fontSize: 16, fontWeight: "800", color: "#1A1A2E" },
  seeAll: { fontSize: 13, color: "#FF6B6B", fontWeight: "600" },
  list: { paddingHorizontal: 20 },
});
