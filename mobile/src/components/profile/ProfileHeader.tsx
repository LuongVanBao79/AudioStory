import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthUser } from "../../types";

interface Props {
  user: AuthUser;
  onEdit: () => void;
}

export default function ProfileHeader({ user, onEdit }: Props) {
  const avatarUri = user.avatar
    ? { uri: user.avatar }
    : {
        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF6B6B&color=fff&size=200`,
      };

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image source={avatarUri} style={styles.avatar} />
        <TouchableOpacity style={styles.editAvatarBtn} onPress={onEdit}>
          <Ionicons name="camera" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>

        {/* Points badge */}
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={12} color="#F6AD55" />
          <Text style={styles.pointsText}>{user.points ?? 0} điểm</Text>
        </View>
      </View>

      {/* Edit button */}
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Ionicons name="pencil-outline" size={18} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrap: { position: "relative", marginRight: 14 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F0F0F0",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800", color: "#1A1A2E" },
  email: { fontSize: 13, color: "#999", marginTop: 3 },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF8EC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  pointsText: { fontSize: 12, color: "#F6AD55", fontWeight: "700" },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
});
