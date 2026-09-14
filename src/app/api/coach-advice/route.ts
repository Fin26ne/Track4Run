import { NextRequest, NextResponse } from "next/server";
import { Type, Schema } from "@google/genai";
import { generateTextWithGemini } from "@/lib/gemini";
import { AICoachAdvice } from "@/lib/types";

const coachResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    assessment: {
      type: Type.STRING,
      description: "Nhận định súc tích, truyền cảm hứng về phong độ, kỷ luật streak và cán cân dinh dưỡng của người dùng bằng tiếng Việt.",
    },
    fatBurnEstimateKg: {
      type: Type.NUMBER,
      description: "Dự kiến số kg mỡ thay đổi (lấy calo thâm hụt chia cho 7700 kcal). Số âm nếu giảm, số dương nếu tăng.",
    },
    deficitStatus: {
      type: Type.STRING,
      enum: ["optimal", "surplus", "aggressive"],
      description: "optimal: thâm hụt 300-600 kcal/ngày; aggressive: thâm hụt > 800 kcal/ngày; surplus: nạp nhiều hơn đốt.",
    },
    nutritionAdvice: {
      type: Type.STRING,
      description: "Lời khuyên dinh dưỡng thiết thực bằng tiếng Việt (khẩu phần calo, tỷ lệ đạm, carb nạp trước/sau khi chạy).",
    },
    workoutAdvice: {
      type: Type.STRING,
      description: "Kế hoạch phân bổ bài chạy bộ cho tuần/tháng tới (số km/tuần, bài chạy dài Long Run, bài phục hồi Easy Run).",
    },
    longTermProjection: {
      type: Type.STRING,
      description: "Dự báo biến chuyển cơ thể, vóc dáng và sức bền trong 1 năm (365 ngày) nếu duy trì đà hiện tại.",
    },
  },
  required: [
    "assessment",
    "fatBurnEstimateKg",
    "deficitStatus",
    "nutritionAdvice",
    "workoutAdvice",
    "longTermProjection",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      daysLogged,
      totalIntake,
      totalBurn,
      netCalories,
      totalDistanceKm,
      weightKg,
      streak,
    } = body;

    const prompt = `
Bạn là Huấn luyện viên Chạy bộ & Chuyên gia Dinh dưỡng Thể thao ACSM (American College of Sports Medicine) đẳng cấp quốc tế.
Hãy phân tích dữ liệu tập luyện và dinh dưỡng trong 30 ngày qua của vận động viên:
- Số ngày có ghi nhận hoạt động: ${daysLogged || 0} / 30 ngày
- Cân nặng cơ thể hiện tại: ${weightKg || 60} kg
- Chuỗi ngày kỷ luật (Streak) hiện tại: ${streak || 0} ngày liên tiếp
- Tổng calo nạp vào (Intake): ${totalIntake || 0} kcal
- Tổng calo đốt từ chạy bộ (Burn): ${totalBurn || 0} kcal
- Net Calo (Intake - Burn): ${netCalories || 0} kcal (âm = thâm hụt, dương = thặng dư)
- Tổng cự ly chạy bộ tích lũy: ${totalDistanceKm || 0} km

Nhiệm vụ của bạn:
1. Đánh giá phong độ thể thao và tính kỷ luật (dựa trên chuỗi streak và số ngày hoạt động).
2. Tính toán quy đổi mỡ: Theo chuẩn ACSM, 1 kg mỡ cơ thể = ~7.700 kcal thâm hụt. Hãy tính dự kiến số kg mỡ thay đổi (làm tròn 1 chữ số thập phân).
3. Đánh giá mức độ thâm hụt:
   - Nếu thâm hụt trung bình 300 - 600 kcal/ngày -> 'optimal' (vùng vàng bảo vệ cơ bắp).
   - Nếu thâm hụt > 800 kcal/ngày -> 'aggressive' (thâm hụt quá sâu, có nguy cơ kiệt sức).
   - Nếu nạp nhiều hơn đốt -> 'surplus' (thặng dư năng lượng).
4. Đưa ra lời khuyên dinh dưỡng súc tích, thực tế bằng tiếng Việt.
5. Đưa ra chiến lược chạy bộ cho tuần/tháng tiếp theo.
6. Dự báo vóc dáng và sức khỏe trong 1 năm (365 ngày) nếu giữ vững phong độ này.

Trả về kết quả chuẩn định dạng JSON theo schema đã định nghĩa.
`.trim();

    const responseText = await generateTextWithGemini({
      prompt,
      responseSchema: coachResponseSchema,
    });

    const parsedResult: AICoachAdvice = JSON.parse(responseText);
    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Lỗi khi tạo lời khuyên AI Coach:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Đã có lỗi xảy ra khi tạo lời khuyên.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
