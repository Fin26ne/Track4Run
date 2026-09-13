import { NextRequest, NextResponse } from "next/server";
import { Type, Schema } from "@google/genai";
import { analyzeImageWithGemini } from "@/lib/gemini";
import { FoodAnalysisResult } from "@/lib/types";

// Định nghĩa responseSchema chặt chẽ theo cấu trúc FoodAnalysisResult
const foodResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      description: "Danh sách các món ăn hoặc thành phần thực phẩm nhận diện được trong ảnh",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Tên món ăn bằng tiếng Việt (ví dụ: 'Phở bò', 'Cơm tấm sườn', 'Trứng ốp la')",
          },
          weightGrams: {
            type: Type.NUMBER,
            description: "Khối lượng ước tính theo gram (g)",
          },
          caloriesPer100g: {
            type: Type.NUMBER,
            description: "Lượng calo trung bình trên 100g thực phẩm này (kcal)",
          },
          totalCalories: {
            type: Type.NUMBER,
            description: "Tổng calo của phần ăn này: (weightGrams * caloriesPer100g) / 100",
          },
          confidence: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
            description: "Độ tin cậy của việc nhận diện món ăn",
          },
        },
        required: ["name", "weightGrams", "caloriesPer100g", "totalCalories", "confidence"],
      },
    },
    totalMealCalories: {
      type: Type.NUMBER,
      description: "Tổng calo ước tính của toàn bộ bữa ăn trong bức ảnh (kcal)",
    },
    note: {
      type: Type.STRING,
      description: "Ghi chú ngắn về thành phần dinh dưỡng, hoặc giải thích nếu ảnh không chứa thức ăn",
    },
  },
  required: ["items", "totalMealCalories"],
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
Bạn là chuyên gia dinh dưỡng thể thao hàng đầu.
Nhiệm vụ của bạn:
1. Quan sát kỹ bức ảnh được cung cấp.
2. Nếu ảnh CHỨA ĐỒ ĂN / ĐỒ UỐNG:
   - Liệt kê chi tiết từng món ăn hoặc thành phần chính có trong đĩa/bữa ăn (tên tiếng Việt quen thuộc).
   - Dựa vào tỉ lệ vật thể trong đĩa/bát để ước lượng khối lượng (gram) thực tế nhất có thể.
   - Ước lượng calo/100g và tính tổng calo cho từng món.
   - Tính tổng calo cho toàn bộ bữa ăn (totalMealCalories).
   - Đánh giá độ tin cậy nhận diện ('low' nếu góc chụp khó/món lạ, 'medium', hoặc 'high' nếu thấy rõ món).
   - Viết lời khuyên hoặc ghi chú ngắn gọn bằng tiếng Việt (ví dụ: nhiều protein, ít rau, món chiên nhiều dầu...).
3. Nếu ảnh KHÔNG PHẢI ĐỒ ĂN hoặc quá mờ không thể nhận biết:
   - Trả về items: []
   - totalMealCalories: 0
   - note: Giải thích rõ ràng bằng tiếng Việt rằng ảnh không chứa thực phẩm hoặc hình ảnh quá mờ để nhận diện.

Hãy trả về kết quả tuân thủ chính xác theo schema JSON đã định nghĩa.
`.trim();

    const responseText = await analyzeImageWithGemini({
      base64Image,
      mimeType,
      prompt,
      responseSchema: foodResponseSchema,
    });

    const parsedResult: FoodAnalysisResult = JSON.parse(responseText);

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Lỗi khi phân tích ảnh món ăn:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Đã có lỗi xảy ra khi phân tích ảnh.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
