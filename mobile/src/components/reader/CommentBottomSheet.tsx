import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCommentStore } from "../../stores/useCommentStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { Comment } from "../../types";
import { ThemeKey, THEMES } from "../../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  chapterId: string;
  bookId: string;
  theme: ThemeKey;
}

// ─────────────────────────────────────────────────────────────
// Helper: tính tổng comment gốc + replies
// ─────────────────────────────────────────────────────────────
function calcTotalWithReplies(
  comments: Comment[],
  serverTotal: number,
): number {
  const replyCount = comments.reduce(
    (sum, c) => sum + (c.replies?.length ?? 0),
    0,
  );
  return serverTotal + replyCount;
}

// ─────────────────────────────────────────────────────────────
// Long-press context menu
// ─────────────────────────────────────────────────────────────
interface ContextMenuProps {
  visible: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onClose: () => void;
  t: (typeof THEMES)[ThemeKey];
}

function ContextMenu({
  visible,
  isOwner,
  onEdit,
  onDelete,
  onReport,
  onClose,
  t,
}: ContextMenuProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={menuStyles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={[menuStyles.menu, { backgroundColor: t.background }]}>
        {isOwner ? (
          <>
            <TouchableOpacity style={menuStyles.item} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={18} color={t.text} />
              <Text style={[menuStyles.itemText, { color: t.text }]}>
                Sửa bình luận
              </Text>
            </TouchableOpacity>
            <View style={menuStyles.divider} />
            <TouchableOpacity style={menuStyles.item} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={[menuStyles.itemText, { color: "#FF6B6B" }]}>
                Xoá bình luận
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={menuStyles.item} onPress={onReport}>
            <Ionicons name="flag-outline" size={18} color="#FF9F43" />
            <Text style={[menuStyles.itemText, { color: "#FF9F43" }]}>
              Báo cáo vi phạm
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const menuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemText: { fontSize: 15, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginHorizontal: 16 },
});

// ─────────────────────────────────────────────────────────────
// Sub-component: 1 comment item
// ─────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
  onEdit,
  onReport,
  t,
}: {
  comment: Comment;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
  onReply: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onReport: (id: string) => void;
  t: (typeof THEMES)[ThemeKey];
}) {
  const isOwner = comment.user._id === currentUserId;
  const [menuVisible, setMenuVisible] = useState(false);
  const [replyMenuTarget, setReplyMenuTarget] = useState<Comment | null>(null);

  return (
    <View style={styles.commentItem}>
      {/* Context menu cho comment gốc */}
      <ContextMenu
        visible={menuVisible}
        isOwner={isOwner}
        onEdit={() => {
          setMenuVisible(false);
          onEdit(comment);
        }}
        onDelete={() => {
          setMenuVisible(false);
          onDelete(comment._id);
        }}
        onReport={() => {
          setMenuVisible(false);
          onReport(comment._id);
        }}
        onClose={() => setMenuVisible(false)}
        t={t}
      />

      {/* Context menu cho reply */}
      {replyMenuTarget && (
        <ContextMenu
          visible={!!replyMenuTarget}
          isOwner={replyMenuTarget.user._id === currentUserId}
          onEdit={() => {
            const target = replyMenuTarget;
            setReplyMenuTarget(null);
            onEdit(target);
          }}
          onDelete={() => {
            const id = replyMenuTarget._id;
            setReplyMenuTarget(null);
            onDelete(id);
          }}
          onReport={() => {
            const id = replyMenuTarget._id;
            setReplyMenuTarget(null);
            onReport(id);
          }}
          onClose={() => setReplyMenuTarget(null)}
          t={t}
        />
      )}

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarWrap}
        onLongPress={() => setMenuVisible(true)}
        delayLongPress={300}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarText}>
          {comment.user.username?.charAt(0)?.toUpperCase() ?? "U"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.commentBody}
        onLongPress={() => setMenuVisible(true)}
        delayLongPress={300}
        activeOpacity={1}
      >
        {/* Header */}
        <View style={styles.commentHeader}>
          <Text style={[styles.username, { color: t.text }]}>
            {comment.user.username}
            {comment.user.role === "admin" && (
              <Text style={styles.adminBadge}> Admin</Text>
            )}
          </Text>
          <Text style={styles.commentDate}>
            {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {/* Nội dung */}
        <Text style={[styles.commentContent, { color: t.text }]}>
          {comment.content}
        </Text>

        {/* Actions — chỉ nút Trả lời */}
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onReply(comment)}
          >
            <Ionicons
              name="return-down-forward-outline"
              size={13}
              color="#999"
            />
            <Text style={styles.actionText}>Trả lời</Text>
          </TouchableOpacity>
          <Text style={styles.longPressHint}>Giữ để thêm tuỳ chọn</Text>
        </View>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <View style={styles.repliesWrap}>
            {comment.replies.map((reply) => {
              const isReplyOwner = reply.user._id === currentUserId;
              return (
                <TouchableOpacity
                  key={reply._id}
                  style={styles.replyItem}
                  onLongPress={() => setReplyMenuTarget(reply)}
                  delayLongPress={300}
                  activeOpacity={1}
                >
                  <View style={[styles.avatarWrap, styles.avatarSmall]}>
                    <Text style={styles.avatarTextSmall}>
                      {reply.user.username?.charAt(0)?.toUpperCase() ?? "U"}
                    </Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <Text
                        style={[
                          styles.username,
                          { color: t.text, fontSize: 12 },
                        ]}
                      >
                        {reply.user.username}
                        {reply.user.role === "admin" && (
                          <Text style={styles.adminBadge}> Admin</Text>
                        )}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.commentContent,
                        { color: t.text, fontSize: 13 },
                      ]}
                    >
                      {reply.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export default function CommentBottomSheet({
  visible,
  onClose,
  chapterId,
  bookId,
  theme,
}: Props) {
  const t = THEMES[theme];

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { requireAuth } = useRequireAuth();

  const {
    comments,
    total,
    hasMore,
    isLoading,
    fetchComments,
    fetchMoreComments,
    createComment,
    deleteComment,
    updateComment, // ← cần thêm vào store
    reportComment, // ← cần thêm vào store
    clearComments,
  } = useCommentStore();

  // ── Local state ─────────────────────────────────────────────
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editTarget, setEditTarget] = useState<Comment | null>(null); // comment đang sửa
  const [isSending, setIsSending] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Tổng số bình luận bao gồm cả replies
  const totalWithReplies = calcTotalWithReplies(comments, total);

  // ── Animate in/out ──────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      clearComments();
      fetchComments(chapterId);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ── Send / Update comment ────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || isSending) return;

    requireAuth(async () => {
      setIsSending(true);
      try {
        if (editTarget) {
          // Đang ở chế độ sửa
          await updateComment(editTarget._id, text.trim());
          setEditTarget(null);
        } else {
          // Tạo mới hoặc reply
          await createComment({
            book: bookId,
            chapter: chapterId,
            content: text.trim(),
            parentComment: replyTo?._id,
          });
          setReplyTo(null);
        }
        setText("");
      } finally {
        setIsSending(false);
      }
    });
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    Alert.alert("Xoá bình luận", "Bạn có chắc muốn xoá bình luận này không?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => deleteComment(id),
      },
    ]);
  };

  // ── Edit ────────────────────────────────────────────────────
  const handleEdit = (comment: Comment) => {
    requireAuth(() => {
      setEditTarget(comment);
      setReplyTo(null);
      setText(comment.content);
      inputRef.current?.focus();
    });
  };

  // ── Reply ───────────────────────────────────────────────────
  const handleReply = (comment: Comment) => {
    requireAuth(() => {
      setEditTarget(null);
      setReplyTo(comment);
      setText("");
      inputRef.current?.focus();
    });
  };

  // ── Report ──────────────────────────────────────────────────
  const handleReport = (id: string) => {
    requireAuth(() => {
      Alert.alert(
        "Báo cáo vi phạm",
        "Bạn có chắc muốn báo cáo bình luận này không? Admin sẽ kiểm duyệt sớm.",
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Báo cáo",
            style: "destructive",
            onPress: async () => {
              try {
                await reportComment(id);
                Alert.alert("Thành công", "Đã báo cáo bình luận!");
              } catch {
                Alert.alert("Lỗi", "Bạn đã báo cáo bình luận này rồi!");
              }
            },
          },
        ],
      );
    });
  };

  // ── Cancel edit/reply ───────────────────────────────────────
  const handleCancelInput = () => {
    setEditTarget(null);
    setReplyTo(null);
    setText("");
  };

  // ── Sheet translate ─────────────────────────────────────────
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  if (!visible) return null;

  const inputPlaceholder = editTarget
    ? "Sửa bình luận..."
    : replyTo
      ? `Trả lời ${replyTo.user.username}...`
      : isLoggedIn
        ? "Viết bình luận..."
        : "Đăng nhập để bình luận";

  // ── Render ──────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: t.background, transform: [{ translateY }] },
        ]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Handle + Header */}
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: t.text }]}>
              Bình luận
              {totalWithReplies > 0 && (
                <Text style={styles.totalCount}> ({totalWithReplies})</Text>
              )}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Danh sách comment */}
          {isLoading && comments.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator color="#FF6B6B" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="chatbubble-outline" size={48} color="#E9ECEF" />
              <Text style={[styles.emptyText, { color: t.text }]}>
                Chưa có bình luận nào
              </Text>
              <Text style={styles.emptyHint}>
                Hãy là người đầu tiên bình luận!
              </Text>
            </View>
          ) : (
            <FlatList
              style={{ flex: 1 }}
              data={comments}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              onEndReached={() => fetchMoreComments(chapterId)}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                hasMore ? (
                  <ActivityIndicator
                    color="#FF6B6B"
                    style={{ marginVertical: 12 }}
                  />
                ) : null
              }
              renderItem={({ item }) => (
                <CommentItem
                  comment={item}
                  currentUserId={user?._id}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onReport={handleReport}
                  t={t}
                />
              )}
            />
          )}

          {/* Banner: đang reply hoặc đang sửa */}
          {(replyTo || editTarget) && (
            <View
              style={[styles.replyBanner, { backgroundColor: t.background }]}
            >
              <View style={styles.replyBannerLeft}>
                <Ionicons
                  name={
                    editTarget
                      ? "pencil-outline"
                      : "return-down-forward-outline"
                  }
                  size={14}
                  color="#FF6B6B"
                />
                <Text style={styles.replyLabel}>
                  {editTarget ? (
                    "Đang sửa bình luận"
                  ) : (
                    <>
                      Đang trả lời{" "}
                      <Text style={{ color: "#FF6B6B", fontWeight: "700" }}>
                        {replyTo!.user.username}
                      </Text>
                    </>
                  )}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCancelInput}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input */}
          <View style={[styles.inputRow, { borderTopColor: t.text + "20" }]}>
            <View style={styles.myAvatar}>
              <Text style={styles.myAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: t.text, backgroundColor: t.text + "10" },
                editTarget && styles.inputEditing,
              ]}
              placeholder={inputPlaceholder}
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              onFocus={() => !isLoggedIn && requireAuth(() => {})}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                editTarget && styles.sendBtnEdit,
                (!text.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!text.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons
                  name={editTarget ? "checkmark" : "send"}
                  size={18}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800" },
  totalCount: { color: "#999", fontWeight: "400", fontSize: 15 },

  list: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 20 },

  commentItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarSmall: { width: 28, height: 28, borderRadius: 8 },
  avatarText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  avatarTextSmall: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  commentBody: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  username: { fontSize: 13, fontWeight: "700" },
  adminBadge: { color: "#FF6B6B", fontSize: 11, fontWeight: "600" },
  commentDate: { fontSize: 11, color: "#BBB" },
  commentContent: { fontSize: 14, lineHeight: 20 },

  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 12, color: "#999" },
  longPressHint: { fontSize: 11, color: "#CCC", marginLeft: "auto" },

  repliesWrap: {
    marginTop: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#F0F0F0",
    gap: 10,
  },
  replyItem: { flexDirection: "row", gap: 8 },

  replyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  replyBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyLabel: { fontSize: 13, color: "#888" },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  myAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  myAvatarText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  inputEditing: {
    borderWidth: 1.5,
    borderColor: "#FF6B6B40",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sendBtnEdit: {
    backgroundColor: "#6C63FF",
  },
  sendBtnDisabled: { backgroundColor: "#FFAAAA" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  emptyHint: { fontSize: 13, color: "#BBB" },
});
