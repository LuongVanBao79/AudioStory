// src/types/chapter.ts

export interface Chapter {
  _id: string;
  book: string;
  chapterNumber: number;
  title: string;
  content: string;
  audioUrl?: string;
  audioPublicId?: string;
  duration?: number;
  isUnlocked?: boolean;
  hasAudio: boolean;
  views: number;
  listenCount?: number;
  prevChapter?: {
    _id: string;
    chapterNumber: number;
    title: string;
  } | null;
  nextChapter?: {
    _id: string;
    chapterNumber: number;
    title: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterFormData {
  book: string;
  title: string;
  content: string;
  voiceType?: string;
  refAudio?: string;
}
