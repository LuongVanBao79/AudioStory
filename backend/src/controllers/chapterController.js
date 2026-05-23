const Chapter = require("../models/Chapter");
const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");
const ChapterProgress = require("../models/ChapterProgress"); // ← THÊM
const { cloudinary } = require("../config/cloudinary");
const axios = require("axios");

// ─────────────────────────────────────────────────────────────
// INTERNAL: Gọi AI Python tạo audio → upload Cloudinary
// ─────────────────────────────────────────────────────────────
const generateAndUploadAudio = async (
  text,
  voiceType = "default",
  refAudio = "",
) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`[TTS] Đang tạo audio (giọng: ${voiceType})...`);

      const response = await axios.post(
        `${process.env.AI_SERVER_URL}/api/tts`,
        { text, voice_type: voiceType, ref_audio: refAudio },
        { timeout: 0 },
      );

      const audioUrlFromPython =
        response.data.audioUrl || response.data.url || response.data.link;

      if (!audioUrlFromPython) {
        return reject(new Error("Không tìm thấy link audio từ Python!"));
      }

      console.log("[TTS] Python xong, đang upload Cloudinary...");

      const downloadUrl = audioUrlFromPython.replace("localhost", "127.0.0.1");

      const audioStream = await axios.get(downloadUrl, {
        responseType: "stream",
        timeout: 0,
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "audiostory/chapters",
          format: "mp3",
        },
        (error, result) => {
          if (error) return reject(error);
          console.log("[TTS] Upload Cloudinary thành công!");
          resolve({
            audioUrl: result.secure_url,
            audioPublicId: result.public_id,
            duration: result.duration || 0,
          });
        },
      );

      audioStream.data.pipe(uploadStream);
    } catch (error) {
      reject(error);
    }
  });
};

const chapterController = {
  // ─────────────────────────────────────────────────────────────
  // [Admin] POST /api/chapters
  // ─────────────────────────────────────────────────────────────
  createChapter: async (req, res) => {
    try {
      const { book, chapterNumber, title, content, voiceType, refAudio } =
        req.body;

      if (!book || !chapterNumber || !title || !content) {
        return res
          .status(400)
          .json({ message: "Vui lòng điền đầy đủ thông tin chương!" });
      }

      const existingBook = await Book.findById(book);
      if (!existingBook) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy cuốn sách này!" });
      }

      const duplicate = await Chapter.findOne({ book, chapterNumber });
      if (duplicate) {
        return res
          .status(400)
          .json({ message: `Chương ${chapterNumber} đã tồn tại!` });
      }

      let audioData = { audioUrl: "", audioPublicId: "", duration: 0 };
      if (content.trim()) {
        audioData = await generateAndUploadAudio(content, voiceType, refAudio);
      }

      const newChapter = await Chapter.create({
        book,
        chapterNumber,
        title,
        content,
        audioUrl: audioData.audioUrl,
        audioPublicId: audioData.audioPublicId,
        duration: audioData.duration,
      });

      await Book.findByIdAndUpdate(book, { $inc: { totalChapters: 1 } });

      res.status(201).json({
        message: "Tạo chương và audio AI thành công!",
        chapter: newChapter,
      });
    } catch (error) {
      console.error("[createChapter]", error);
      res.status(500).json({ message: "Lỗi hệ thống khi tạo chương!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] PUT /api/chapters/:id
  // ─────────────────────────────────────────────────────────────
  updateChapter: async (req, res) => {
    try {
      const chapter = await Chapter.findById(req.params.id);
      if (!chapter)
        return res.status(404).json({ message: "Không tìm thấy chương!" });

      const { title, chapterNumber, content, isUnlocked, voiceType, refAudio } =
        req.body;

      let audioUrl = chapter.audioUrl;
      let audioPublicId = chapter.audioPublicId;
      let duration = chapter.duration;

      if (content && content !== chapter.content) {
        const audioData = await generateAndUploadAudio(
          content,
          voiceType,
          refAudio,
        );

        if (chapter.audioPublicId) {
          await cloudinary.uploader.destroy(chapter.audioPublicId, {
            resource_type: "video",
          });
        }

        audioUrl = audioData.audioUrl;
        audioPublicId = audioData.audioPublicId;
        duration = audioData.duration;
      }

      const updated = await Chapter.findByIdAndUpdate(
        req.params.id,
        {
          title,
          chapterNumber,
          content,
          isUnlocked,
          audioUrl,
          audioPublicId,
          duration,
        },
        { new: true },
      );

      res
        .status(200)
        .json({ message: "Cập nhật chương thành công!", chapter: updated });
    } catch (error) {
      console.error("[updateChapter]", error);
      res.status(500).json({ message: "Lỗi khi cập nhật chương!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Admin] DELETE /api/chapters/:id
  // ─────────────────────────────────────────────────────────────
  deleteChapter: async (req, res) => {
    try {
      const chapter = await Chapter.findById(req.params.id);
      if (!chapter)
        return res.status(404).json({ message: "Không tìm thấy chương!" });

      if (chapter.audioPublicId) {
        await cloudinary.uploader.destroy(chapter.audioPublicId, {
          resource_type: "video",
        });
      }

      await Chapter.findByIdAndDelete(req.params.id);
      await Book.findByIdAndUpdate(chapter.book, {
        $inc: { totalChapters: -1 },
      });

      // Xoá luôn ChapterProgress liên quan
      await ChapterProgress.deleteMany({ chapter: req.params.id });

      res.status(200).json({ message: "Đã xoá chương thành công!" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xoá chương!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile + Admin] GET /api/chapters/book/:bookId
  // ─────────────────────────────────────────────────────────────
  getChaptersByBook: async (req, res) => {
    try {
      const chapters = await Chapter.find({ book: req.params.bookId })
        .select("chapterNumber title duration isUnlocked audioUrl createdAt")
        .sort({ chapterNumber: 1 })
        .lean();

      res.status(200).json({ data: chapters });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách chương!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/chapters/:id
  // ─────────────────────────────────────────────────────────────
  getChapterById: async (req, res) => {
    try {
      const chapter = await Chapter.findById(req.params.id).lean();
      if (!chapter)
        return res.status(404).json({ message: "Không tìm thấy chương!" });

      const [prevChapter, nextChapter] = await Promise.all([
        Chapter.findOne({
          book: chapter.book,
          chapterNumber: chapter.chapterNumber - 1,
        })
          .select("_id chapterNumber title")
          .lean(),
        Chapter.findOne({
          book: chapter.book,
          chapterNumber: chapter.chapterNumber + 1,
        })
          .select("_id chapterNumber title")
          .lean(),
      ]);

      res.status(200).json({
        message: "Lấy chi tiết chương thành công",
        data: {
          ...chapter,
          prevChapter: prevChapter || null,
          nextChapter: nextChapter || null,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy chi tiết chương!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] POST /api/chapters/:id/progress  (cần login)
  // Lưu CẢ 2: ReadingProgress (đang ở đâu) + ChapterProgress (từng chương)
  // ─────────────────────────────────────────────────────────────
  saveProgress: async (req, res) => {
    try {
      const { audioPosition = 0, isCompleted = false } = req.body;

      const chapter = await Chapter.findById(req.params.id).lean();
      if (!chapter)
        return res.status(404).json({ message: "Không tìm thấy chương!" });

      // 1. Upsert ReadingProgress (1/sách) ← "đang đọc đến đâu"
      await ReadingProgress.findOneAndUpdate(
        { user: req.user._id, book: chapter.book },
        {
          chapter: chapter._id,
          audioPosition,
          isCompleted,
        },
        { upsert: true, new: true },
      );

      // 2. Upsert ChapterProgress (1/chương) ← tiến độ từng chương
      await ChapterProgress.findOneAndUpdate(
        { user: req.user._id, chapter: chapter._id },
        {
          book: chapter.book,
          audioPosition,
          // ✅ Chỉ set isCompleted = true, không cho "un-complete"
          ...(isCompleted && { isCompleted: true }),
        },
        { upsert: true, new: true },
      );

      res.status(200).json({ message: "Lưu tiến độ thành công" });
    } catch (error) {
      console.error("[saveProgress]", error);
      res.status(500).json({ message: "Lỗi khi lưu tiến độ!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/chapters/progress/:bookId  (cần login)
  // Lấy tiến độ đang nghe dở của 1 cuốn sách (ReadingProgress)
  // ─────────────────────────────────────────────────────────────
  getProgress: async (req, res) => {
    try {
      const progress = await ReadingProgress.findOne({
        user: req.user._id,
        book: req.params.bookId,
      }).populate("chapter", "chapterNumber title audioUrl duration");

      res.status(200).json({ data: progress || null });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy tiến độ!" });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // [Mobile] GET /api/chapters/chapter-progress/:bookId  (cần login)
  // Lấy tiến độ từng chương → trả về dạng map { chapterId: {...} }
  // ─────────────────────────────────────────────────────────────
  getChapterProgressByBook: async (req, res) => {
    try {
      const progresses = await ChapterProgress.find({
        user: req.user._id,
        book: req.params.bookId,
      })
        .select("chapter audioPosition isCompleted")
        .lean();

      // Chuyển thành map để frontend lookup O(1)
      const progressMap = progresses.reduce((acc, p) => {
        acc[p.chapter.toString()] = {
          audioPosition: p.audioPosition,
          isCompleted: p.isCompleted,
        };
        return acc;
      }, {});

      res.status(200).json({ data: progressMap });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server!" });
    }
  },
};

module.exports = chapterController;
