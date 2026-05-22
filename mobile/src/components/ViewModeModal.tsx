import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ViewMode = "list" | "grid" | "quick";
export type SortMode = "updated" | "most_read";

interface ViewModeModalProps {
  visible: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  sortMode: SortMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onChangeSortMode: (sort: SortMode) => void;
}

const VIEW_OPTIONS: {
  key: ViewMode;
  label: string;
  icon: string;
}[] = [
  {
    key: "list",
    label: "Danh sách",
    icon: "list-outline",
  },
  {
    key: "grid",
    label: "Lưới",
    icon: "grid-outline",
  },
  {
    key: "quick",
    label: "Duyệt nhanh",
    icon: "apps-outline",
  },
];

const SORT_OPTIONS: { key: SortMode; label: string; icon: string }[] = [
  { key: "updated", label: "Mới cập nhật", icon: "time-outline" },
  { key: "most_read", label: "Đọc nhiều nhất", icon: "flame-outline" },
];

export default function ViewModeModal({
  visible,
  onClose,
  viewMode,
  sortMode,
  onChangeViewMode,
  onChangeSortMode,
}: ViewModeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Cách hiển thị */}
          <Text style={styles.sectionTitle}>Hiển thị</Text>
          {VIEW_OPTIONS.map((opt) => {
            const active = viewMode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => onChangeViewMode(opt.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.iconWrap, active && styles.iconWrapActive]}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={20}
                    color={active ? "#FF6B6B" : "#888"}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionLabel,
                      active && styles.optionLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          {/* Sắp xếp */}
          <Text style={styles.sectionTitle}>Sắp xếp</Text>
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => {
              const active = sortMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => onChangeSortMode(opt.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={15}
                    color={active ? "#FFF" : "#666"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[styles.sortLabel, active && styles.sortLabelActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Xác nhận */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Xong</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#F8F9FA",
  },
  optionActive: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconWrapActive: { backgroundColor: "#FFE0E0" },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  optionLabelActive: { color: "#FF6B6B" },
  optionDesc: { fontSize: 12, color: "#AAA", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 16 },
  sortRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  sortChipActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  sortLabel: { fontSize: 13, fontWeight: "600", color: "#666" },
  sortLabelActive: { color: "#FFF" },
  doneBtn: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
