import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Cấu hình cách hiển thị thông báo khi app đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  days: number[]; // 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 0=CN
  message: string;
}

const STORAGE_KEY = "reading_reminder_settings";

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 21,
  minute: 0,
  days: [1, 2, 3, 4, 5, 6, 0], // Mặc định tất cả các ngày
  message: "Đến giờ đọc sách rồi! 📖 Dành 30 phút hôm nay nhé.",
};

export function useReadingReminder() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // Load settings từ AsyncStorage khi khởi động
  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const requestPermission = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);
    return granted;
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Lỗi khi load reminder settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: ReminderSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Lỗi khi lưu reminder settings:", error);
    }
  };

  // Hủy tất cả notification nhắc nhở đang được lên lịch
  const cancelAllReminders = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith("reading-reminder-")) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  };

  // Lên lịch notification cho từng ngày được chọn
  const scheduleReminders = async (config: ReminderSettings) => {
    await cancelAllReminders();

    if (!config.enabled || config.days.length === 0) return;

    for (const day of config.days) {
      // expo-notifications: weekday 1=CN, 2=T2, ..., 7=T7
      // Cần map: 0(CN)→1, 1(T2)→2, ..., 6(T7)→7
      const weekday = day === 0 ? 1 : day + 1;

      await Notifications.scheduleNotificationAsync({
        identifier: `reading-reminder-day-${day}`,
        content: {
          title: "AudioStory 📖",
          body: config.message,
          sound: true,
          data: { type: "reading-reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: config.hour,
          minute: config.minute,
        },
      });
    }
  };

  // Bật nhắc nhở: xin quyền → lên lịch → lưu settings
  const enableReminder = async (config: Omit<ReminderSettings, "enabled">) => {
    const granted = hasPermission || (await requestPermission());
    if (!granted) return false;

    const newSettings: ReminderSettings = { ...config, enabled: true };
    await scheduleReminders(newSettings);
    await saveSettings(newSettings);
    return true;
  };

  // Tắt nhắc nhở: hủy tất cả → lưu settings
  const disableReminder = async () => {
    await cancelAllReminders();
    const newSettings: ReminderSettings = { ...settings, enabled: false };
    await saveSettings(newSettings);
  };

  // Cập nhật cài đặt và lên lịch lại
  const updateReminder = async (config: Omit<ReminderSettings, "enabled">) => {
    const newSettings: ReminderSettings = { ...config, enabled: true };
    await scheduleReminders(newSettings);
    await saveSettings(newSettings);
  };

  return {
    settings,
    loading,
    hasPermission,
    enableReminder,
    disableReminder,
    updateReminder,
    requestPermission,
  };
}
