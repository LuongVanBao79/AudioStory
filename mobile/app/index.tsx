import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  StatusBar,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "1",
    icon: "headset" as const,
    iconBg: "#FF6B6B",
    accentColor: "#FF6B6B",
    tag: "TRẢI NGHIỆM",
    title: "Nghe sách\nmọi lúc\nmọi nơi",
    desc: "Biến mọi khoảnh khắc rảnh thành hành trình khám phá tri thức — khi lái xe, tập thể dục hay trước khi ngủ.",
    decorIcon1: "musical-notes",
    decorIcon2: "volume-high",
  },
  {
    id: "2",
    icon: "library" as const,
    iconBg: "#6C63FF",
    accentColor: "#6C63FF",
    tag: "KHO NỘI DUNG",
    title: "Hàng nghìn\ntựa sách\nchờ bạn",
    desc: "Từ self-help, kinh doanh đến tiểu thuyết và tâm lý học — đủ thể loại, cập nhật liên tục mỗi tuần.",
    decorIcon1: "book",
    decorIcon2: "star",
  },
  {
    id: "3",
    icon: "trending-up" as const,
    iconBg: "#00B894",
    accentColor: "#00B894",
    tag: "THEO DÕI",
    title: "Tiến độ\ncủa bạn\nluôn rõ ràng",
    desc: "Xem thống kê thời gian nghe, số sách hoàn thành và duy trì thói quen đọc sách mỗi ngày.",
    decorIcon1: "checkmark-circle",
    decorIcon2: "flame",
  },
];

// ─────────────────────────────────────────────────────────────
// Floating decoration dots
// ─────────────────────────────────────────────────────────────
function FloatingDots({ color }: { color: string }) {
  const dots = useRef(
    Array.from({ length: 6 }, () => ({
      anim: new Animated.Value(0),
      x: Math.random() * (width - 60) + 30,
      y: Math.random() * (height * 0.55) + 20,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 1500,
    })),
  ).current;

  useEffect(() => {
    dots.forEach((dot) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(dot.delay),
          Animated.timing(dot.anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(dot.anim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: color,
            opacity: dot.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.08, 0.3],
            }),
            transform: [
              {
                translateY: dot.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -12],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Slide
// ─────────────────────────────────────────────────────────────
function Slide({ item }: { item: (typeof SLIDES)[0] }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <View style={[slideStyles.slide]}>
      <FloatingDots color={item.accentColor} />

      {/* ── Illustration area ── */}
      <View style={slideStyles.illustrationArea}>
        {/* Large background circle */}
        <View
          style={[
            slideStyles.bgCircleLarge,
            { backgroundColor: item.accentColor + "10" },
          ]}
        />
        <View
          style={[
            slideStyles.bgCircleMedium,
            { backgroundColor: item.accentColor + "18" },
          ]}
        />

        {/* Decor icons floating */}
        <View
          style={[
            slideStyles.decorIcon,
            slideStyles.decorIconLeft,
            { backgroundColor: item.accentColor + "15" },
          ]}
        >
          <Ionicons
            name={item.decorIcon1 as any}
            size={20}
            color={item.accentColor}
          />
        </View>
        <View
          style={[
            slideStyles.decorIcon,
            slideStyles.decorIconRight,
            { backgroundColor: item.accentColor + "15" },
          ]}
        >
          <Ionicons
            name={item.decorIcon2 as any}
            size={20}
            color={item.accentColor}
          />
        </View>

        {/* Main icon */}
        <Animated.View
          style={[
            slideStyles.iconWrap,
            {
              backgroundColor: item.iconBg,
              transform: [{ scale: iconScale }, { rotate }],
            },
          ]}
        >
          <Ionicons name={item.icon as any} size={56} color="#FFF" />
        </Animated.View>

        {/* Waveform decoration */}
        <View style={slideStyles.waveRow}>
          {[3, 6, 9, 14, 10, 7, 12, 8, 5, 9, 13, 6, 4].map((h, i) => (
            <View
              key={i}
              style={[
                slideStyles.waveBar,
                {
                  height: h * 3,
                  backgroundColor: item.accentColor,
                  opacity: 0.25 + (i % 3) * 0.15,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Text area ── */}
      <Animated.View
        style={[
          slideStyles.textArea,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View
          style={[
            slideStyles.tag,
            { backgroundColor: item.accentColor + "15" },
          ]}
        >
          <Text style={[slideStyles.tagText, { color: item.accentColor }]}>
            {item.tag}
          </Text>
        </View>

        <Text style={slideStyles.title}>{item.title}</Text>

        <Text style={slideStyles.desc}>{item.desc}</Text>
      </Animated.View>
    </View>
  );
}

const slideStyles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
  },
  illustrationArea: {
    height: height * 0.46,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bgCircleLarge: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
  },
  bgCircleMedium: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
  },
  decorIcon: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  decorIconLeft: { left: width * 0.1, top: height * 0.06 },
  decorIconRight: { right: width * 0.1, top: height * 0.1 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 28,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },

  // Text
  textArea: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#1A1A2E",
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: "#888",
    lineHeight: 24,
    fontWeight: "400",
  },
});

// ─────────────────────────────────────────────────────────────
// Dot indicator
// ─────────────────────────────────────────────────────────────
function Dots({
  count,
  active,
  color,
}: {
  count: number;
  active: number;
  color: string;
}) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            dotStyles.dot,
            i === active
              ? [dotStyles.dotActive, { backgroundColor: color, width: 24 }]
              : dotStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 7, borderRadius: 4 },
  dotActive: {},
  dotInactive: { width: 7, backgroundColor: "#DDD" },
});

// ─────────────────────────────────────────────────────────────
// Main — WelcomeScreen
// ─────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems[0]?.index !== null &&
        viewableItems[0]?.index !== undefined
      ) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("@onboarding_done", "1");
    router.replace("/(tabs)");
  };

  const pressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 200,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const currentColor = SLIDES[activeIndex].accentColor;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Skip button ── */}
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleGetStarted}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      )}

      {/* ── Logo ── */}
      <View style={styles.logoRow}>
        <View style={[styles.logoIcon, { backgroundColor: currentColor }]}>
          <Ionicons name="headset" size={14} color="#FFF" />
        </View>
        <Text style={styles.logoText}>AudioStory</Text>
      </View>

      {/* ── Slides ── */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => <Slide item={item} />}
        style={{ flex: 1 }}
      />

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <Dots count={SLIDES.length} active={activeIndex} color={currentColor} />

        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentColor }]}
            onPress={goNext}
            onPressIn={pressIn}
            onPressOut={pressOut}
            activeOpacity={1}
          >
            {isLast ? (
              <>
                <Text style={styles.nextBtnText}>Bắt đầu</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </>
            ) : (
              <Ionicons name="arrow-forward" size={22} color="#FFF" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },

  skipBtn: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  skipText: { fontSize: 13, fontWeight: "600", color: "#999" },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 8,
    zIndex: 5,
  },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 16, fontWeight: "800", color: "#1A1A2E" },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 12,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 56,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  nextBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
});
