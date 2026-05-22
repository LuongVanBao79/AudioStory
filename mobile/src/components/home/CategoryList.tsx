import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Category } from "../../types";

interface Props {
  categories: Category[];
  selectedId?: string;
  onSelectCategory: (category: Category) => void;
}

export default function CategoryList({
  categories,
  selectedId,
  onSelectCategory,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = item._id === selectedId;
          return (
            <TouchableOpacity
              style={[styles.badge, isSelected && styles.badgeActive]}
              activeOpacity={0.75}
              onPress={() => onSelectCategory(item)}
            >
              <Text
                style={[styles.badgeText, isSelected && styles.badgeTextActive]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 4 },
  list: { paddingHorizontal: 20, gap: 8 },
  badge: {
    backgroundColor: "#F0F0F5",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: "#FF6B6B",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  badgeTextActive: { color: "#FFF" },
});
