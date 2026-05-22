from vieneu import Vieneu

tts = Vieneu()
voices = tts.list_preset_voices()

print("\nDANH SÁCH GIỌNG ĐỌC CÓ SẴN:")
for desc, voice_id in voices:
    print(f"- {desc} ---> Mã ID: '{voice_id}'")