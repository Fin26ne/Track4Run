import { GoogleGenAI, Schema } from "@google/genai";

interface AnalyzeImageOptions {
  base64Image: string;
  mimeType: string;
  prompt: string;
  responseSchema?: Schema;
}

/**
 * Helper gọi Gemini Flash để phân tích ảnh.
 * Ưu tiên model gemini-2.5-flash theo yêu cầu, tự động fallback sang gemini-3.6-flash
 * nếu tài khoản mới nhận thông báo 404 (model không còn mở cho tài khoản mới).
 * CHỈ SỬ DỤNG TRONG SERVER-SIDE ROUTE HANDLERS.
 */
export async function analyzeImageWithGemini({
  base64Image,
  mimeType,
  prompt,
  responseSchema,
}: AnalyzeImageOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "Chưa cấu hình GEMINI_API_KEY trên server. Vui lòng thiết lập biến môi trường GEMINI_API_KEY trong file .env.local"
    );
  }

  // Khởi tạo client GoogleGenAI với API key từ server environment
  const ai = new GoogleGenAI({ apiKey });

  const modelsToTry = ["gemini-2.5-flash", "gemini-3.6-flash"];
  let lastError: unknown;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
        config: {
          responseMimeType: "application/json",
          ...(responseSchema ? { responseSchema } : {}),
        },
      });

      const text = response.text;
      if (text) {
        return text;
      }
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.includes("404") ||
        errMsg.includes("no longer available") ||
        errMsg.includes("NOT_FOUND")
      ) {
        console.warn(`Model ${model} báo 404 (không khả dụng với tài khoản này), chuyển sang model ${modelsToTry[1]}...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Không nhận được nội dung phản hồi từ Gemini API.");
}
