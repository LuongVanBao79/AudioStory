const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db.js");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/authRoutes.js");
const bookRoutes = require("./src/routes/bookRoutes.js");
const chapterRoutes = require("./src/routes/chapterRoutes.js");
const categoryRoutes = require("./src/routes/categoryRoutes.js");
const authorRoutes = require("./src/routes/authorRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes.js");
const commentRoutes = require("./src/routes/commentRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const adminRoutes = require("./src/routes/dashboardRoutes.js");
const favoriteRoutes = require("./src/routes/favoriteRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes.js");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:8081",
        "https://audio-story-hx8m.vercel.app",
      ];

      // ✅ Cho phép mobile app (không có origin) + các domain whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Thêm dòng này để xử lý preflight
app.options("*", cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server dang chay tai http://localhost:${PORT}`);
});
