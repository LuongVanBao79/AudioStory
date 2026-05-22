from flask import Flask, request, jsonify, send_from_directory
from vieneu import Vieneu
import numpy as np
import soundfile as sf
from pydub import AudioSegment
import uuid
import os
import re

app = Flask(__name__)

AUDIO_DIR = "public_audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

# ==========================================
# KHỞI TẠO VIE-NEU TTS AI MODEL
# ==========================================
print("⏳ Đang tải mô hình VieNeu-TTS-0.3B-Q4-0-GGUF...")
try:
    tts = Vieneu()
    # Mặc định VieNeu xuất âm thanh ở sample rate 24000Hz
    SAMPLE_RATE = 24000 
    print("✅ Tải Model thành công!")
except Exception as e:
    print(f"❌ LỖI: Không thể khởi tạo. Vui lòng kiểm tra đã cài eSpeak NG chưa: {e}")

# ==========================================
# CÁC HÀM XỬ LÝ VĂN BẢN (NLP)
# ==========================================
def normalize_numbers(text):
    """
    Hàm cơ bản chuyển số thành chữ (Bạn có thể dùng thư viện xịn hơn để xử lý số phức tạp).
    Ở đây ví dụ chuyển các số cơ bản từ 0-9.
    """
    num_map = {'0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn', 
               '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín'}
    for digit, word in num_map.items():
        text = text.replace(digit, f" {word} ")
    return re.sub(r'\s+', ' ', text).strip()

def preprocess_text(text):
    """Chuẩn hóa Unicode, xóa khoảng trắng thừa và ký tự lạ"""
    # Thay thế xuống dòng bằng dấu chấm để tách câu
    text = text.replace('\n', '. ')
    # Chuẩn hóa số thành chữ
    text = normalize_numbers(text)
    # Lọc giữ lại chữ cái, số tiếng Việt và các dấu câu cơ bản
    text = re.sub(r'[^\w\s.,!?àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]', '', text)
    # Gộp các khoảng trắng thừa
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def split_into_chunks(text, max_length=200):
    """
    Tách văn bản dài thành các câu ngắn dựa trên dấu câu.
    Giới hạn độ dài max_length để AI không bị quá tải.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_length:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return [c for c in chunks if len(c) > 0]

# ==========================================
# API ENDPOINTS
# ==========================================
@app.route('/api/tts', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        raw_text = data.get("text", "")
        
        if not raw_text:
            return jsonify({"message": "Thiếu nội dung text!"}), 400

        # ==========================================
        # CẤU HÌNH GIỌNG ĐỌC (VOICE OPTIONS)
        # ==========================================
        
        # Lấy thông tin từ Postman gửi lên
        voice_type = data.get("voice_type", "Xuân Vĩnh (Nam - Miền Nam)") 
        
        # Lấy thêm tên file mẫu (nếu người dùng chọn clone)
        ref_audio_filename = data.get("ref_audio", "")

        current_voice = None 

        if voice_type == "clone":
            # 1. Nếu voice_type là "clone", ta sẽ tìm đường dẫn đến file âm thanh mẫu
            ref_audio_path = os.path.abspath(os.path.join("reference_voices", ref_audio_filename))
            
            # 2. Kiểm tra xem file mẫu có tồn tại trong ổ cứng không
            if not os.path.exists(ref_audio_path):
                return jsonify({"message": f"Lỗi: Không tìm thấy file mẫu tại {ref_audio_path}"}), 400
            
            print(f"-> Đang phân tích và trích xuất giọng từ file: {ref_audio_filename}...")
            # 3. Yêu cầu AI clone giọng
            current_voice = tts.encode_reference(ref_audio_path)
            
        elif voice_type:
            # Nếu không phải clone, thì nạp các giọng mặc định (Bích Ngọc, Phạm Tuyên...)
            try:
                current_voice = tts.get_preset_voice(voice_type)
            except Exception as e:
                print(f"Không tìm thấy giọng '{voice_type}', sẽ dùng mặc định.")

        print("\n--- BẮT ĐẦU XỬ LÝ TRUYỆN DÀI ---")
        clean_text = preprocess_text(raw_text)
        chunks = split_into_chunks(clean_text)
        
        silence_duration = 0.5 
        silence_array = np.zeros(int(SAMPLE_RATE * silence_duration), dtype=np.float32)
        all_audio_data = []

        for i, chunk in enumerate(chunks):
            print(f" Đang đọc đoạn {i+1}/{len(chunks)}: {chunk[:30]}...")
            
            # Truyền biến current_voice vào model để thay đổi giọng
            audio_chunk = tts.infer(text=chunk, voice=current_voice)
            
            all_audio_data.append(audio_chunk)
            if i < len(chunks) - 1:
                all_audio_data.append(silence_array)

        # ==========================================
        # NỐI VÀ LƯU RA FILE WAV TẠM THỜI
        # ==========================================
        final_audio = np.concatenate(all_audio_data)
        final_audio = np.asarray(final_audio, dtype=np.float32)
        if final_audio.ndim > 1:
            final_audio = final_audio.flatten()

        file_id = str(uuid.uuid4())
        temp_wav_path = os.path.abspath(os.path.join(AUDIO_DIR, f"{file_id}.wav"))
        mp3_path = os.path.abspath(os.path.join(AUDIO_DIR, f"{file_id}.mp3"))
        
        sf.write(temp_wav_path, final_audio, SAMPLE_RATE)
        print(f"-> Đã ghi file WAV tạm thời.")

        # ==========================================
        # CONVERT SANG MP3 VÀ DỌN DẸP RÁC
        # ==========================================
        print("-> Đang nén âm thanh sang MP3 (Giảm 90% dung lượng)...")
        audio_segment = AudioSegment.from_wav(temp_wav_path)
        
        # Nén mp3 với bitrate 64k (Rất lý tưởng cho giọng nói con người, tiết kiệm băng thông)
        audio_segment.export(mp3_path, format="mp3", bitrate="64k")
        
        # Xoá file WAV gốc (rất nặng) khỏi ổ cứng để tiết kiệm không gian
        os.remove(temp_wav_path)
        print(f"-> Nén MP3 thành công! Đã dọn dẹp file nháp.")

        # ==========================================
        # UPLOAD CLOUDINARY (Bạn tự tuỳ chỉnh ở đây)
        # ==========================================
        # upload_result = cloudinary.uploader.upload(mp3_path, resource_type="video")
        # cloudinary_url = upload_result.get("secure_url")
        # => Lưu cloudinary_url vào Database của bạn
        # Lưu ý: Nhớ viết thêm lệnh os.remove(mp3_path) sau khi upload xong để xoá luôn mp3 nhé!

        # Tạm thời trả về Link local nếu chưa ráp Cloudinary
        audio_url = f"http://localhost:5000/audio/{file_id}.mp3" 
        
        return jsonify({
            "message": "Chuyển đổi truyện thành công!",
            "audioUrl": audio_url
        }), 200

    except Exception as e:
        print(f"Lỗi hệ thống: {e}") 
        return jsonify({"message": "Lỗi server AI", "error": str(e)}), 500


@app.route('/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)