import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

export default function LoadingScreen({
  message = "Đang tải...",
}: {
  message?: string;
}) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Skeleton cards */}
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[styles.skeletonCard, { opacity: pulse }]}
        />
      ))}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
    paddingTop: 60,
  },
  skeletonCard: {
    height: 220,
    borderRadius: 16,
    backgroundColor: "#E9ECEF",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 20,
  },
});
