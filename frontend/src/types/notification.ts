export type NotificationType = "new_comment" | "new_review" | "reported";

export interface Notification {
  _id: string;
  type: NotificationType;
  bookTitle: string;
  bookId: string;
  userName: string;
  userId: string;
  preview: string;
  targetId: string;
  reportCount?: number; // chỉ có khi type = "reported"
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  unreadCount: number;
}
