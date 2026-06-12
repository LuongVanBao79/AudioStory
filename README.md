# 🚀 Hướng dẫn cài đặt AudioStory

---

## Bước 1 — Clone dự án

```bash
git clone https://github.com/LuongVanBao79/AudioStory.git
cd AudioStory
```

---

## Bước 2 — Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/audiostory
# Hoặc dùng MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/audiostory

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Cloudinary (lấy tại cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Server URL
AI_SERVER_URL=http://localhost:5000
```

Khởi động backend:

```bash
# Development (tự reload khi sửa code)
npm run dev

# Production
npm start
```

> ✅ Server sẽ chạy tại `http://localhost:3000`

---

## Bước 3 — Cài đặt Frontend (Admin Dashboard)

```bash
cd ../frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Khởi động frontend:

```bash
npm run dev
```

> ✅ Dashboard sẽ chạy tại `http://localhost:5173`

---

## Bước 4 — Cài đặt AI Server (Python TTS)

### 4.1 Cài eSpeak NG (bắt buộc)

**Ubuntu / Debian:**

```bash
sudo apt-get install espeak-ng
```

**macOS:**

```bash
brew install espeak-ng
```

**Windows:**
Tải installer tại [espeak-ng/releases](https://github.com/espeak-ng/espeak-ng/releases)

---

### 4.2 Cài đặt dependencies Python

```bash
cd ../ai_server
python -m venv venv

# Kích hoạt môi trường ảo
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install flask vieneu numpy soundfile pydub
```

> ⚠️ **Lưu ý:** Model VieNeu-TTS sẽ được tải xuống tự động lần đầu chạy (~vài trăm MB).

---

### 4.3 Khởi động AI Server

```bash
python app.py
```

> ✅ AI Server sẽ chạy tại `http://localhost:5000`

---

## Bước 5 — Cài đặt Mobile App

```bash
cd ../mobile
npm install
```

### 5.1 Cập nhật địa chỉ IP

Mở file `mobile/src/api/axiosClient.js` và thay địa chỉ IP LAN của máy tính bạn:

```js
const url = __DEV__
  ? "http://192.168.X.X:3000/api"  // ← Thay bằng IP LAN của máy bạn
  : "https://audiostory-backend.onrender.com/api";
```

> 💡 Tìm IP LAN bằng lệnh `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux)

---

### 5.2 Chạy ứng dụng

```bash
# Khởi động Expo
npx expo start

# Chạy trên Android Emulator
npx expo start --android

# Chạy trên iOS Simulator (chỉ macOS)
npx expo start --ios

# Chạy trên thiết bị thật: Quét QR code bằng Expo Go
```

---

## 📋 Tổng hợp các cổng dịch vụ

| Dịch vụ | URL |
|---|---|
| Backend | `http://localhost:3000` |
| Frontend | `http://localhost:5173` |
| AI Server | `http://localhost:5000` |
| Mobile | Quét QR code bằng Expo Go |
