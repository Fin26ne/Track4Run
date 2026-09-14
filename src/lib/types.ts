/**
 * Đại diện cho một món ăn đơn lẻ được AI nhận diện từ ảnh.
 */
export interface FoodItem {
  name: string;             // Tên món ăn (tiếng Việt)
  weightGrams: number;      // Khối lượng ước lượng (gram)
  caloriesPer100g: number;  // Lượng calo trung bình trên 100g món này
  totalCalories: number;    // Tổng calo của phần ăn: (weightGrams * caloriesPer100g) / 100
  confidence: "low" | "medium" | "high"; // Độ tin cậy nhận diện của AI
  proteinGrams?: number;    // Lượng đạm ước tính (g)
  carbsGrams?: number;      // Lượng tinh bột ước tính (g)
  fatGrams?: number;        // Lượng chất béo ước tính (g)
  portionReasoning?: string;// Căn cứ trực quan ước lượng (ví dụ: 'Dựa vào đĩa 15cm, ước lượng cơm ~120g')
}

/**
 * Kết quả phân tích toàn bộ ảnh đồ ăn từ AI.
 */
export interface FoodAnalysisResult {
  items: FoodItem[];        // Danh sách các món ăn nhận diện được
  totalMealCalories: number;// Tổng calo của toàn bộ bữa ăn
  totalProtein?: number;    // Tổng đạm toàn bữa ăn (g)
  totalCarbs?: number;      // Tổng tinh bột toàn bữa ăn (g)
  totalFat?: number;        // Tổng chất béo toàn bữa ăn (g)
  appliedContextNote?: string; // Xác nhận cách AI đã áp dụng ghi chú/kích thước/khẩu phần của người dùng
  note?: string;            // Ghi chú thêm (hoặc lý do nếu ảnh không phải đồ ăn)
}

/**
 * Số liệu chạy bộ trích xuất từ ảnh chụp đồng hồ / app thể thao.
 */
export interface RunDataFromImage {
  distanceKm: number | null;     // Quãng đường (km)
  durationMinutes: number | null;// Thời gian chạy (phút)
  pace?: string | null;          // Tốc độ/pace đọc được (ví dụ: "5:30 min/km")
  note?: string;                 // Ghi chú hoặc cảnh báo nếu mờ
}

/**
 * Dữ liệu đầu vào để tính calo chạy bộ.
 */
export interface ManualRunInput {
  distanceKm: number;      // Quãng đường (km)
  durationMinutes: number; // Thời gian chạy (phút)
  weightKg: number;        // Cân nặng người chạy (kg)
}

/**
 * Kết quả tính toán calo tiêu thụ và các chỉ số chuyển hóa theo chuẩn ACSM.
 */
export interface RunCalorieResult {
  speedKmH: number;            // Vận tốc (km/h)
  speedMPerMin: number;        // Vận tốc (mét/phút)
  vo2: number;                 // Mức tiêu thụ oxy ước tính (ml/kg/min)
  met: number;                 // Chỉ số tương đương chuyển hóa năng lượng (MET)
  kcalPerMinute: number;       // Tốc độ đốt calo mỗi phút (kcal/phút)
  totalCaloriesBurned: number; // Tổng lượng calo tiêu thụ (kcal)
  warning?: string;            // Cảnh báo nếu vận tốc < 5 km/h
}

// ====================================================================
// CÁC KIỂU DỮ LIỆU CƠ SỞ DỮ LIỆU SUPABASE (DATABASE MODELS)
// ====================================================================

export interface Profile {
  id: string;
  weight_kg: number;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string; // Định dạng YYYY-MM-DD
  items: FoodItem[];
  total_calories: number;
  note?: string | null;
}

export interface RunLog {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string; // Định dạng YYYY-MM-DD
  distance_km: number;
  duration_minutes: number;
  calories_burned: number;
  met_value: number;
  source: "manual" | "photo";
}

export type GoalType =
  | "daily_intake_max"
  | "daily_burn_min"
  | "weekly_distance_km"
  | "monthly_deficit_kcal";

export interface Goal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_value: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Tổng hợp dữ liệu theo từng ngày cho Lịch sử & Thuật toán Streak.
 */
export interface DaySummary {
  date: string;              // YYYY-MM-DD
  totalIntake: number;       // Tổng calo nạp (kcal)
  totalBurn: number;         // Tổng calo tiêu thụ từ chạy bộ (kcal)
  netCalories: number;       // Calo ròng = totalIntake - totalBurn
  totalDistanceKm: number;   // Tổng km chạy trong ngày
  hasLogs: boolean;          // Ngày này có ít nhất 1 log ăn hoặc chạy hay không
  metGoals: boolean;         // Có đạt tiêu chí ngày thành công cho Streak hay không
  foodLogs: FoodLog[];       // Danh sách bữa ăn trong ngày
  runLogs: RunLog[];         // Danh sách buổi chạy trong ngày
}

/**
 * Lời khuyên và nhận định cá nhân hóa từ AI Coach (chu kỳ 30 ngày & cả năm).
 */
export interface AICoachAdvice {
  assessment: string;        // Nhận định thể trạng & phong độ
  fatBurnEstimateKg: number; // Dự kiến kg mỡ thay đổi (âm là giảm, dương là tăng)
  deficitStatus: "optimal" | "surplus" | "aggressive"; // Đánh giá mức độ an toàn
  nutritionAdvice: string;   // Lời khuyên điều chỉnh dinh dưỡng
  workoutAdvice: string;     // Kế hoạch chạy bộ tuần/tháng tiếp theo
  longTermProjection: string;// Dự báo 1 năm nếu duy trì phong độ này
}

