import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
  hasBorder?: boolean;
  rightEl?: React.ReactNode; // Cho phép custom element bên phải
}

export default function MenuItem({
  icon,
  title,
  subtitle,
  color = "#333",
  onPress,
  hasBorder = true,
  rightEl,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.item, hasBorder && styles.border]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {rightEl ?? <Ionicons name="chevron-forward" size={18} color="#CCC" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  border: { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#999", marginTop: 2 },
});
