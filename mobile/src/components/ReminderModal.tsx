import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useReadingReminder,
  ReminderSettings,
} from "../hooks/useReadingReminder";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAY_VALUES = [0, 1, 2, 3, 4, 5, 6];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const PRESET_MESSAGES = [
  "Đến giờ đọc sách rồi! 📖 Dành 30 phút hôm nay nhé.",
  "Chào buổi tối! Cùng nghe sách thư giãn nhé 🎧",
  "Đọc mỗi ngày, tri thức mỗi ngày 🌟",
  "Hôm nay bạn đã đọc chưa? Bắt đầu thôi! 📚",
];

export default function ReminderModal({ visible, onClose }: Props) {
  const { settings, loading, enableReminder, disableReminder, updateReminder } =
    useReadingReminder();

  const [enabled, setEnabled] = useState(false);
  const [selectedHour, setSelectedHour] = useState(21);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedDays, setSelectedDays] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 0,
  ]);
  const [selectedMessage, setSelectedMessage] = useState(PRESET_MESSAGES[0]);
  const [saving, setSaving] = useState(false);

  // Sync state với settings từ storage
  useEffect(() => {
    if (!loading) {
      setEnabled(settings.enabled);
      setSelectedHour(settings.hour);
      setSelectedMinute(settings.minute);
      setSelectedDays(settings.days);
      setSelectedMessage(settings.message);
    }
  }, [settings, loading]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    if (enabled && selectedDays.length === 0) {
      Alert.alert(
        "Chưa chọn ngày",
        "Vui lòng chọn ít nhất một ngày trong tuần.",
      );
      return;
    }

    setSaving(true);
    try {
      const config: Omit<ReminderSettings, "enabled"> = {
        hour: selectedHour,
        minute: selectedMinute,
        days: selectedDays,
        message: selectedMessage,
      };

      if (enabled) {
        const success = await enableReminder(config);
        if (!success) {
          Alert.alert(
            "Không có quyền thông báo",
            "Vui lòng cấp quyền thông báo trong cài đặt điện thoại để dùng tính năng này.",
            [{ text: "Đóng" }],
          );
          setSaving(false);
          return;
        }
      } else {
        await disableReminder();
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhắc nhở đọc sách</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Toggle bật/tắt */}
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="notifications" size={22} color="#6C63FF" />
                </View>
                <View>
                  <Text style={styles.toggleTitle}>Nhắc nhở hàng ngày</Text>
                  <Text style={styles.toggleSub}>
                    {enabled
                      ? `Đang bật · ${formatTime(selectedHour, selectedMinute)}`
                      : "Đang tắt"}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: "#E0E0E0", true: "#C4C0FF" }}
                thumbColor={enabled ? "#6C63FF" : "#f4f3f4"}
              />
            </View>
          </View>

          {enabled && (
            <>
              {/* Chọn giờ */}
              <Text style={styles.sectionTitle}>Thời gian</Text>
              <View style={styles.card}>
                <Text style={styles.timeDisplay}>
                  {formatTime(selectedHour, selectedMinute)}
                </Text>

                {/* Chọn giờ */}
                <Text style={styles.pickerLabel}>Giờ</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.pickerScroll}
                >
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.pickerItem,
                        selectedHour === h && styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedHour(h)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === h && styles.pickerItemTextActive,
                        ]}
                      >
                        {h.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Chọn phút */}
                <Text style={styles.pickerLabel}>Phút</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.pickerScroll}
                >
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.pickerItem,
                        selectedMinute === m && styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === m && styles.pickerItemTextActive,
                        ]}
                      >
                        {m.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Chọn ngày */}
              <Text style={styles.sectionTitle}>Lặp lại</Text>
              <View style={styles.card}>
                <View style={styles.daysRow}>
                  {DAY_VALUES.map((day, idx) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayBtn,
                        selectedDays.includes(day) && styles.dayBtnActive,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayBtnText,
                          selectedDays.includes(day) && styles.dayBtnTextActive,
                        ]}
                      >
                        {DAY_LABELS[idx]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.selectAllBtn}
                  onPress={() =>
                    setSelectedDays(
                      selectedDays.length === 7 ? [] : [...DAY_VALUES],
                    )
                  }
                >
                  <Text style={styles.selectAllText}>
                    {selectedDays.length === 7
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nội dung thông báo */}
              <Text style={styles.sectionTitle}>Nội dung thông báo</Text>
              <View style={styles.card}>
                {PRESET_MESSAGES.map((msg) => (
                  <TouchableOpacity
                    key={msg}
                    style={[
                      styles.messageOption,
                      selectedMessage === msg && styles.messageOptionActive,
                    ]}
                    onPress={() => setSelectedMessage(msg)}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        selectedMessage === msg && styles.messageTextActive,
                      ]}
                    >
                      {msg}
                    </Text>
                    {selectedMessage === msg && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#6C63FF"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Nút lưu */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons
              name={enabled ? "notifications" : "notifications-off"}
              size={20}
              color="#FFF"
            />
            <Text style={styles.saveBtnText}>
              {saving
                ? "Đang lưu..."
                : enabled
                  ? "Lưu nhắc nhở"
                  : "Tắt nhắc nhở"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 30,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0EEFF",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  toggleSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: "800",
    color: "#6C63FF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -1,
  },
  pickerLabel: {
    fontSize: 12,
    color: "#AAA",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  pickerScroll: {
    marginBottom: 12,
  },
  pickerItem: {
    width: 48,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  pickerItemActive: {
    backgroundColor: "#6C63FF",
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  pickerItemTextActive: {
    color: "#FFF",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  dayBtnActive: {
    backgroundColor: "#6C63FF",
  },
  dayBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  dayBtnTextActive: {
    color: "#FFF",
  },
  selectAllBtn: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  selectAllText: {
    fontSize: 13,
    color: "#6C63FF",
    fontWeight: "600",
  },
  messageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  messageOptionActive: {
    backgroundColor: "#F8F7FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  messageText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  messageTextActive: {
    color: "#6C63FF",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});
