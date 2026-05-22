// src/components/reader/TableOfContentsModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { THEMES, ThemeKey } from "../../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  chapters: any[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  theme: ThemeKey;
}

export default function TableOfContentsModal({
  visible,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  theme,
}: Props) {
  const currentTheme = THEMES[theme];

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView
        style={[
          styles.tocContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <View
          style={[
            styles.tocHeader,
            { borderBottomColor: theme === "dark" ? "#444" : "#EEE" },
          ]}
        >
          <Text style={[styles.tocTitle, { color: currentTheme.text }]}>
            Mục lục
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={currentTheme.text} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {chapters.map((chap) => (
            <TouchableOpacity
              key={chap._id}
              style={[
                styles.tocItem,
                { borderBottomColor: theme === "dark" ? "#333" : "#F0F0F0" },
              ]}
              onPress={() => onSelectChapter(chap._id)}
            >
              <Text
                style={[
                  { fontSize: 16, color: currentTheme.text },
                  chap._id === currentChapterId && {
                    color: "#FF6B6B",
                    fontWeight: "bold",
                  },
                ]}
              >
                {chap.title}
              </Text>
              {chap._id === currentChapterId && (
                <Ionicons name="radio-button-on" size={16} color="#FF6B6B" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tocContainer: { flex: 1 },
  tocHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  tocTitle: { fontSize: 20, fontWeight: "bold" },
  tocItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
});
