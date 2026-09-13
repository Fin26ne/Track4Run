import { NextRequest, NextResponse } from "next/server";
import { Type, Schema } from "@google/genai";
import { analyzeImageWithGemini } from "@/lib/gemini";
import { RunDataFromImage } from "@/lib/types";

// Schema trích xuất dữ liệu chạy bộ từ ảnh chụp
const runPhotoResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    distanceKm: {
      type: Type.NUMBER,
      description:
        "Quãng đường chạy được tính bằng Kilomet (km). Ví dụ: 5.0, 10.25. Nếu ảnh hiển thị đơn vị dặm (mi), BẮT BUỘC quy đổi sang km (1 mile = 1.60934 km). Nếu không đọc được số quãng đường, trả về null.",
      nullable: true,
    },
    durationMinutes: {
      type: Type.NUMBER,
      description:
        "Tổng thời gian chạy quy đổi sang số phút (dạng số thập phân). Ví dụ: '30:00' -> 30; '45:30' -> 45.5; '1:15:00' -> 75. Nếu không đọc được số thời gian, trả về null.",
      nullable: true,
    },
    pace: {
      type: Type.STRING,
      description:
        "Tốc độ trung bình (Pace) hiển thị trên màn hình nếu có (ví dụ: '5:30 /km', '6:05 min/km'). Nếu không tìm thấy trả về null.",
      nullable: true,
    },
    note: {
      type: Type.STRING,
      description:
        "Ghi chú ngắn bằng tiếng Việt: loại thiết bị hoặc app nhận diện được (ví dụ: Garmin Forerunner, Strava, Apple Watch Workout...), hoặc cảnh báo nếu ảnh bị mờ/chói lóa.",
    },
  },
  required: ["distanceKm", "durationMinutes"],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Image, mimeType } = body;

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ dữ liệu ảnh (base64Image) và định dạng (mimeType)." },
        { status: 400 }
      );
    }

    const prompt = `
Bạn là chuyên gia phân tích dữ liệu tập luyện thể thao (Garmin, Strava, Apple Watch, Coros, Nike Run Club, Polar, Suunto...).
Nhiệm vụ của bạn:
1. Đọc và bóc tách các thông số buổi chạy bộ từ bức ảnh chụp màn hình đồng hồ hoặc ứng dụng.
2. Tìm kiếm:
   - QUÃNG ĐƯỜNG: Xác định số và đơn vị. Nếu đơn vị là dặm (mi / miles), hãy nhân với 1.60934 để chuyển thành Kilomet (km). Trả về dạng số (number).
   - THỜI GIAN CHẠY: Nhận diện thời lượng (Time / Elapsed Time / Moving Time). Chuyển đổi định dạng mm:ss hoặc hh:mm:ss sang tổng số PHÚT dạng số thập phân. Ví dụ:
     * 25:00 -> 25
     * 30:30 -> 30.5
     * 1:00:00 -> 60
     * 1:30:15 -> 90.25
   - PACE: Nếu có thông số Pace trung bình (Average Pace), hãy trích xuất chuỗi text (ví dụ: '5:24 /km').
3. Nếu ảnh quá mờ, bị che khuất hoặc không phải ảnh liên quan đến chạy bộ/tập luyện, hãy đặt distanceKm hoặc durationMinutes là null và ghi rõ lý do trong note.
4. Trả về kết quả tuân thủ nghiêm ngặt định dạng JSON schema đã khai báo.
`.trim();

    const responseText = await analyzeImageWithGemini({
      base64Image,
      mimeType,
      prompt,
      responseSchema: runPhotoResponseSchema,
    });

    const parsedResult: RunDataFromImage = JSON.parse(responseText);

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Lỗi khi phân tích ảnh đồng hồ chạy bộ:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Đã có lỗi xảy ra khi phân tích ảnh chạy bộ.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
