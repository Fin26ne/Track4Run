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
      description: "Danh sách các món ăn hoặc thành phần thực phẩm nhận diện được trong ảnh (không tính trùng lặp)",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Tên món ăn bằng tiếng Việt (ví dụ: 'Phở bò', 'Cơm trắng', 'Sườn nướng', 'Trứng ốp la')",
          },
          weightGrams: {
            type: Type.NUMBER,
            description: "Khối lượng phần ăn được thực tế theo gram (g). Bỏ qua xương và vỏ.",
          },
          caloriesPer100g: {
            type: Type.NUMBER,
            description: "Lượng calo trung bình trên 100g thực phẩm này (kcal)",
          },
          totalCalories: {
            type: Type.NUMBER,
            description: "Tổng calo của phần ăn này: Math.round((weightGrams * caloriesPer100g) / 100)",
          },
          proteinGrams: {
            type: Type.NUMBER,
            description: "Lượng đạm (protein) ước tính theo gram (g)",
          },
          carbsGrams: {
            type: Type.NUMBER,
            description: "Lượng tinh bột (carbohydrates) ước tính theo gram (g)",
          },
          fatGrams: {
            type: Type.NUMBER,
            description: "Lượng chất béo (fat) ước tính theo gram (g)",
          },
          portionReasoning: {
            type: Type.STRING,
            description: "Căn cứ trực quan ước lượng khối lượng (ví dụ: 'Dựa vào đĩa ~15cm ước tính khoảng 1 bát con cơm ~130g')",
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
    totalProtein: {
      type: Type.NUMBER,
      description: "Tổng lượng đạm toàn bữa ăn theo gram (g)",
    },
    totalCarbs: {
      type: Type.NUMBER,
      description: "Tổng lượng tinh bột toàn bữa ăn theo gram (g)",
    },
    totalFat: {
      type: Type.NUMBER,
      description: "Tổng lượng chất béo toàn bữa ăn theo gram (g)",
    },
    appliedContextNote: {
      type: Type.STRING,
      description: "Xác nhận ngắn gọn và minh bạch cách bạn đã tiếp nhận và áp dụng kích thước/khẩu phần/loại trừ từ ghi chú của người dùng (nếu có)",
    },
    note: {
      type: Type.STRING,
      description: "Ghi chú ngắn về dinh dưỡng bữa ăn, hoặc giải thích nếu ảnh không chứa thức ăn",
    },
  },
  required: ["items", "totalMealCalories"],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Image, mimeType, userContext } = body;

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ dữ liệu ảnh (base64Image) và định dạng (mimeType)." },
        { status: 400 }
      );
    }

    const userContextSection =
      userContext && typeof userContext === "string" && userContext.trim().length > 0
        ? `
=== THÔNG TIN & YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG (CỰC KỲ QUAN TRỌNG) ===
"${userContext.trim()}"

HƯỚNG DẪN XỬ LÝ THEO NGỮ CẢNH CỦA NGƯỜI DÙNG:
1. Hiệu chuẩn kích thước vật lý (Physical scale calibration):
   - Nếu người dùng cung cấp số đo của dụng cụ đựng (ví dụ: "đĩa tầm 15cm", "đĩa 20cm", "bát nhỏ 10cm", "hộp xốp nhỏ", v.v.):
     Hãy lấy thông số kích thước này làm thước đo trực quan tham chiếu trực tiếp (pixel-to-cm) để ước lượng thể tích và khối lượng (gram) thực tế của từng món.
     Tuyệt đối KHÔNG tự động giả định là đĩa nhà hàng cỡ lớn (25-30cm) khiến món ăn bị ước tính dư calo quá mức.
2. Khẩu phần thực nạp (Portion eaten):
   - Nếu người dùng ghi "chỉ ăn 1 nửa", "ăn 50%", "bỏ 1/3 cơm", v.v.:
     Hãy tính khối lượng (weightGrams) và calo CHỈ CHO PHẦN THỰC SỰ ĂN.
3. Loại trừ thành phần không ăn (Exclusions):
   - Nếu người dùng ghi "không ăn nước dùng", "không ăn da/mỡ", "bỏ tóp mỡ", "không chấm sốt", v.v.:
     Hãy LOẠI TRỪ calo của những thành phần đó ra khỏi tổng bữa ăn, hoặc không tính calo cho phần bị loại bỏ.
4. Ghi nhận vào appliedContextNote:
   - Giải thích ngắn gọn và minh bạch cách bạn đã căn chỉnh tính toán theo ghi chú của người dùng (Ví dụ: "Đã dựa vào kích thước đĩa 15cm để ước lượng cơm ~120g và loại trừ calo nước dùng theo ghi chú của bạn.").
========================================================================
`
        : `
(Người dùng không cung cấp ghi chú riêng. Hãy ước lượng theo khẩu phần ăn thực tế thông thường của người Việt Nam).
`;

    const prompt = `
Bạn là chuyên gia dinh dưỡng thể thao và phân tích thị giác máy tính hàng đầu.
Nhiệm vụ của bạn:
1. Quan sát kỹ bức ảnh được cung cấp kết hợp với THÔNG TIN NGỮ CẢNH TỪ NGƯỜI DÙNG (nếu có).
${userContextSection}

2. NGUYÊN TẮC QUAN TRỌNG ĐỂ TÍNH TOÁN MINH BẠCH VÀ CHỐNG TÍNH DƯ THỪA (ANTI-OVERESTIMATION):
   - Chuẩn hóa khẩu phần ẩm thực Việt Nam:
     + 1 chén/bát cơm gia đình tiêu chuẩn chỉ khoảng 130g - 160g (~170 - 210 kcal). Tránh ước lượng phóng đại lên 250-300g trừ khi ảnh thấy rõ đĩa cơm rất nhiều.
     + Chỉ tính khối lượng phần ăn được thực tế (Edible portion): LOẠI TRỪ XƯƠNG (xương sườn, xương gà, xương cá) và VỎ (vỏ tôm, cua, ốc). Ví dụ: 1 miếng sườn cốt lết nhìn to nhưng chỉ có ~70g - 90g thịt ăn được.
   - Chống tính trùng lặp (Anti-double-counting):
     + Nếu đĩa ăn gồm các món riêng biệt (cơm, thịt nướng, trứng, rau): bóc tách từng món riêng lẻ, KHÔNG tạo thêm một dòng tổng hợp tên món combo làm đội gấp đôi calo.
   - Bóc tách dinh dưỡng đa lượng (Macros):
     + Ước tính đầy đủ proteinGrams, carbsGrams, fatGrams cho từng món và tổng toàn bữa ăn (totalProtein, totalCarbs, totalFat).
   - Căn cứ trực quan (portionReasoning):
     + Ghi rõ căn cứ vì sao ước lượng ra số gram đó (kết hợp với kích thước đĩa/bát người dùng cung cấp nếu có).

3. Nếu ảnh CHỨA ĐỒ ĂN / ĐỒ UỐNG:
   - Trả về danh sách items với đầy đủ thông tin chi tiết.
   - totalMealCalories: Tổng calo của toàn bộ bữa ăn thực nạp.
   - totalProtein, totalCarbs, totalFat: Tổng số gram đa lượng tương ứng.
   - appliedContextNote: Lời giải thích cách đã áp dụng ghi chú người dùng (nếu có ghi chú).
   - note: Lời khuyên dinh dưỡng ngắn gọn bằng tiếng Việt.

4. Nếu ảnh KHÔNG PHẢI ĐỒ ĂN hoặc quá mờ không thể nhận biết:
   - items: []
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
