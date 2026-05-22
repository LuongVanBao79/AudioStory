import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio } from "expo-av";

import { useChapterStore } from "../../src/stores/useChapterStore";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useBookStore } from "../../src/stores/useBookStore";
import { THEMES } from "../../src/constants/theme";

import ReaderTopBar from "../../src/components/reader/ReaderTopBar";
import ReaderBottomBar from "../../src/components/reader/ReaderBottomBar";
import AudioPlayerMini, {
  PlaybackSpeed,
} from "../../src/components/reader/AudioPlayerMini";
import ReaderSettingsModal from "../../src/components/reader/ReaderSettingsModal";
import TableOfContentsModal from "../../src/components/reader/TableOfContentsModal";
import CommentBottomSheet from "../../src/components/reader/CommentBottomSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useReaderSettings } from "@/src/hooks/useReaderSettings";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SAVE_PROGRESS_INTERVAL = 15000;

// ─────────────────────────────────────────────────────────────
// Helper: unload an toàn
// ─────────────────────────────────────────────────────────────
const safeUnload = async (s: Audio.Sound | null) => {
  if (!s) return;
  try {
    const status = await s.getStatusAsync();
    if (status.isLoaded) {
      await s.stopAsync();
      await s.unloadAsync();
    }
  } catch {}
};

// ─────────────────────────────────────────────────────────────
export default function ChapterReaderScreen() {
  const { id, startPosition } = useLocalSearchParams<{
    id: string;
    startPosition?: string;
  }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // ── Stores ──────────────────────────────────────────────────
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const {
    selectedChapter,
    chapters,
    isLoading,
    fetchChapterById,
    fetchChaptersByBook,
    saveProgress,
  } = useChapterStore();

  const { incrementListen, incrementView } = useBookStore();

  // ── UI States ────────────────────────────────────────────────
  const [showControls, setShowControls] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // ── Scroll progress ──────────────────────────────────────────
  const [scrollViewHeight, setScrollViewHeight] = useState(1);
  const [contentHeight, setContentHeight] = useState(1);

  const scrollProgress = Math.min(
    1,
    Math.max(
      0,
      contentHeight > scrollViewHeight
        ? scrollPosition / (contentHeight - scrollViewHeight)
        : 0,
    ),
  );

  // ── Reader Settings ──────────────────────────────────────────
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
  } = useReaderSettings();

  // ── Audio States ─────────────────────────────────────────────
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const listenedRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  // ✅ Track xem đã lưu "đang đọc" chưa — reset mỗi lần đổi chương
  const savedReadingRef = useRef(false);

  const currentTheme = THEMES[theme];

  // ── Fetch chương khi mount ────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetchChapterById(id);
    listenedRef.current = false;
    savedReadingRef.current = false;
  }, [id]);

  // ── Fetch mục lục ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedChapter?.book) return;
    fetchChaptersByBook(selectedChapter.book);
  }, [selectedChapter?.book]);

  // ── ✅ Lưu "đang đọc" ngay khi chapter load xong ─────────────
  // Dùng selectedChapter._id làm dependency để chắc chắn chapter đã có data
  // Chỉ gọi khi: đã login + chapter load xong + chưa lưu lần này + chưa play audio
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!id) return;
    if (!selectedChapter?._id) return; // chapter chưa load xong
    if (savedReadingRef.current) return; // đã lưu rồi
    if (position > 0) return; // đang nghe audio → không ghi đè

    savedReadingRef.current = true;

    // Gọi thẳng service để thấy lỗi nếu có (không dùng store vì store nuốt lỗi)
    import("../../src/services/chapterService").then(({ chapterService }) => {
      chapterService
        .saveProgress(id, { audioPosition: 0, isCompleted: false })
        .then(() => console.log("[Reading] Đã lưu đang đọc chương:", id))
        .catch((err) => console.warn("[Reading] Lỗi lưu tiến độ đọc:", err));
    });
  }, [isLoggedIn, id, selectedChapter?._id]);

  // ── Restore scroll position ───────────────────────────────────
  useEffect(() => {
    if (!id || !selectedChapter) return;
    AsyncStorage.getItem(`scroll_${id}`).then((saved) => {
      if (saved && Number(saved) > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Number(saved),
            animated: false,
          });
        }, 300);
      }
    });
  }, [selectedChapter]);

  // ── Cleanup khi unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      StatusBar.setHidden(false);
      if (Platform.OS === "android") {
        NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, []);

  // ── Immersive mode ────────────────────────────────────────────
  const toggleImmersive = useCallback(async (hide: boolean) => {
    StatusBar.setHidden(hide, "fade");
    if (Platform.OS === "android") {
      try {
        await NavigationBar.setVisibilityAsync(hide ? "hidden" : "visible");
      } catch {}
    }
  }, []);

  const handleSpeedChange = useCallback(async (val: PlaybackSpeed) => {
    const s = soundRef.current;
    if (!s) return;
    try {
      await s.setRateAsync(val, true);
      setSpeed(val);
    } catch {
      console.log("[Audio] Lỗi đổi tốc độ");
    }
  }, []);

  // ── Tap to toggle controls ────────────────────────────────────
  const handleTapScreen = useCallback(() => {
    setShowControls((prev) => {
      const next = !prev;
      if (!next) setShowAudioPlayer(false);
      toggleImmersive(!next);
      return next;
    });
  }, [toggleImmersive]);

  // ── Navigation ────────────────────────────────────────────────
  const currentIndex = chapters.findIndex((c) => c._id === id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < chapters.length - 1;

  const goToChapter = useCallback(
    async (chapterId: string) => {
      await AsyncStorage.removeItem(`scroll_${id}`);
      await safeUnload(soundRef.current);
      soundRef.current = null;
      setSound(null);
      setIsAudioLoaded(false);
      setShowToc(false);
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);
      router.replace(`/chapter/${chapterId}`);
    },
    [id],
  );

  // ── Đóng màn hình ─────────────────────────────────────────────
  const handleClose = useCallback(async () => {
    if (isLoggedIn && id) {
      // position > 0  → đang nghe audio → lưu đúng giây
      // position === 0 → chỉ đọc text   → lưu audioPosition = 0
      await saveProgress(id, Math.floor(position / 1000), false);
      console.log("[Close] Lưu tiến độ:", Math.floor(position / 1000), "s");
    }

    if (id) {
      await AsyncStorage.setItem(`scroll_${id}`, String(scrollPosition));
    }

    await safeUnload(soundRef.current);
    soundRef.current = null;
    setSound(null);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, id, position, scrollPosition]);

  // ── Audio: load khi bật player ────────────────────────────────
  useEffect(() => {
    if (!showAudioPlayer || !selectedChapter?.audioUrl || isAudioLoaded) return;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: selectedChapter.audioUrl },
          {
            shouldPlay: true,
            positionMillis: startPosition ? Number(startPosition) : 0,
          },
          (status) => {
            if (!status.isLoaded) return;
            setDuration(status.durationMillis ?? 0);
            if (!isSliding) setPosition(status.positionMillis ?? 0);
            setIsPlaying(status.isPlaying);
          },
        );

        setSound(newSound);
        soundRef.current = newSound;
        setIsAudioLoaded(true);
      } catch (err) {
        console.log("[Audio] Lỗi nạp audio:", err);
      }
    };

    load();
  }, [showAudioPlayer]);

  // ── Cleanup CHỈ khi unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      safeUnload(soundRef.current);
      soundRef.current = null;
    };
  }, []);

  // ── Tăng lượt nghe khi bắt đầu phát ─────────────────────────
  useEffect(() => {
    if (!isPlaying || listenedRef.current) return;
    if (!selectedChapter?.book) return;
    listenedRef.current = true;
    incrementListen(selectedChapter.book);
  }, [isPlaying]);

  const viewedRef = useRef(false);

  useEffect(() => {
    viewedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!selectedChapter?.book || viewedRef.current) return;
    viewedRef.current = true;
    incrementView(selectedChapter.book);
  }, [selectedChapter?.book]);

  // ── Lưu tiến độ audio mỗi 15 giây ───────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !isPlaying || !id) return;

    const timer = setInterval(async () => {
      const posSeconds = Math.floor(position / 1000);
      await saveProgress(id, posSeconds, false);
      console.log(`[Audio Progress] Lưu: ${posSeconds}s`);
    }, SAVE_PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, [isLoggedIn, isPlaying, position, id]);

  // ── Lưu khi nghe xong ────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !id || duration === 0) return;
    if (position >= duration - 1000) {
      saveProgress(id, Math.floor(duration / 1000), true);
      console.log("[Progress] Hoàn thành chương!");
    }
  }, [position, duration]);

  // ── Audio controls ────────────────────────────────────────────
  const togglePlayPause = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return;
    try {
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      isPlaying ? await s.pauseAsync() : await s.playAsync();
    } catch {
      console.log("[Audio] Lỗi play/pause");
    }
  }, [isPlaying]);

  const seekAudio = useCallback(async (ms: number) => {
    const s = soundRef.current;
    if (!s) return;
    try {
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      await s.setPositionAsync(ms);
      setPosition(ms);
    } catch {
      console.log("[Audio] Lỗi seek");
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────
  if (isLoading && !selectedChapter) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ color: currentTheme.text, marginTop: 12 }}>
          Đang tải chương...
        </Text>
      </View>
    );
  }

  if (!selectedChapter) {
    return (
      <View
        style={[styles.center, { backgroundColor: currentTheme.background }]}
      >
        <Text style={{ color: "#FF6B6B" }}>Không tìm thấy chương này</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={["top"]}
    >
      {/* Vùng đọc */}
      <ScrollView
        ref={scrollViewRef}
        onScroll={(e) => setScrollPosition(e.nativeEvent.contentOffset.y)}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContentHeight(h)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (showControls) {
            setShowControls(false);
            setShowAudioPlayer(false);
            toggleImmersive(true);
          }
        }}
      >
        <TouchableWithoutFeedback onPress={handleTapScreen}>
          <View style={[styles.content, { minHeight: SCREEN_HEIGHT }]}>
            <Text
              style={{
                fontSize,
                lineHeight: fontSize * lineHeight,
                color: currentTheme.text,
                textAlign: "justify",
                fontFamily: fontFamily === "System" ? undefined : fontFamily,
              }}
            >
              {selectedChapter.content ?? "Đang cập nhật nội dung..."}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Thanh cuộn dọc */}
      <View style={styles.scrollbarTrack} pointerEvents="none">
        <View
          style={[
            styles.scrollbarTrackLine,
            { backgroundColor: currentTheme.text + "18" },
          ]}
        >
          <View
            style={[
              styles.scrollbarThumb,
              {
                backgroundColor: currentTheme.text + "55",
                top: `${scrollProgress * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Controls nổi */}
      {showControls && (
        <>
          <ReaderTopBar
            title={selectedChapter.title}
            chapterNumber={selectedChapter.chapterNumber}
            theme={theme}
            onClose={handleClose}
            onScrollTop={() =>
              scrollViewRef.current?.scrollTo({ y: 0, animated: true })
            }
          />

          {showAudioPlayer && isAudioLoaded && selectedChapter.audioUrl && (
            <AudioPlayerMini
              theme={theme}
              position={position}
              duration={duration}
              isPlaying={isPlaying}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={async (val) => {
                await seekAudio(val);
                setIsSliding(false);
              }}
              onPlayPause={togglePlayPause}
              onSkipBackward={() => seekAudio(Math.max(0, position - 15000))}
              onSkipForward={() =>
                seekAudio(Math.min(duration, position + 15000))
              }
              speed={speed}
              onSpeedChange={handleSpeedChange}
            />
          )}

          <ReaderBottomBar
            theme={theme}
            showAudioPlayer={isPlaying || showAudioPlayer}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onOpenSettings={() => setShowSettings(true)}
            onToggleAudio={() => setShowAudioPlayer((p) => !p)}
            onOpenToc={() => setShowToc(true)}
            onOpenComments={() => setShowComments(true)}
            onPrev={() =>
              hasPrev && goToChapter(chapters[currentIndex - 1]._id)
            }
            onNext={() =>
              hasNext && goToChapter(chapters[currentIndex + 1]._id)
            }
          />
        </>
      )}

      {/* Modals */}
      <ReaderSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />

      <TableOfContentsModal
        visible={showToc}
        onClose={() => setShowToc(false)}
        chapters={chapters}
        currentChapterId={id!}
        onSelectChapter={goToChapter}
        theme={theme}
      />

      <CommentBottomSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        chapterId={id!}
        bookId={selectedChapter.book}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  content: { padding: 24, paddingTop: 80, paddingBottom: 140 },

  scrollbarTrack: {
    position: "absolute",
    right: 0,
    top: "12%",
    bottom: "12%",
    width: 16,
    alignItems: "center",
  },
  scrollbarTrackLine: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    position: "relative",
  },
  scrollbarThumb: {
    position: "absolute",
    width: 2,
    height: 40,
    borderRadius: 1,
    marginTop: -20,
  },
});
