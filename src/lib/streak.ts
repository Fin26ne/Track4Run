import { DaySummary, FoodLog, Goal, RunLog } from "./types";

/**
 * Định dạng ngày YYYY-MM-DD theo giờ địa phương (local timezone).
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Thuật toán tính Streak (chuỗi ngày liên tiếp đạt mục tiêu hoặc duy trì hoạt động).
 *
 * @param days Mảng DaySummary đã được sắp xếp giảm dần theo ngày (mới nhất ở đầu)
 * @returns Số ngày streak liên tiếp hiện tại
 */
export function calculateStreak(days: DaySummary[]): number {
  if (!days || days.length === 0) {
    return 0;
  }

  let streak = 0;
  let startIndex = 0;

  // Nếu ngày đầu tiên (hôm nay) chưa có bất kỳ log nào,
  // bắt đầu đếm lùi từ hôm qua (index 1) để không làm đứt chuỗi của người dùng trong ngày đang diễn ra.
  if (days[0] && !days[0].hasLogs) {
    startIndex = 1;
  }

  for (let i = startIndex; i < days.length; i++) {
    const day = days[i];
    if (day.metGoals) {
      streak++;
    } else {
      // Dừng lại ngay ở ngày đầu tiên không đạt
      break;
    }
  }

  return streak;
}

/**
 * Gom nhóm food_logs và run_logs thành danh sách DaySummary liên tục theo khoảng ngày.
 *
 * @param foodLogs Danh sách bữa ăn
 * @param runLogs Danh sách buổi chạy bộ
 * @param goals Danh sách mục tiêu của user
 * @param numDays Số ngày liên tục cần tổng hợp ngược từ hôm nay (mặc định 60 ngày)
 */
export function buildDaySummaries(
  foodLogs: FoodLog[],
  runLogs: RunLog[],
  goals: Goal[],
  numDays: number = 60
): DaySummary[] {
  const activeIntakeGoal = goals.find(
    (g) => g.goal_type === "daily_intake_max" && g.is_active
  );
  const activeBurnGoal = goals.find(
    (g) => g.goal_type === "daily_burn_min" && g.is_active
  );
  const hasDailyGoals = Boolean(activeIntakeGoal || activeBurnGoal);

  // Tạo map tra cứu nhanh theo ngày YYYY-MM-DD
  const foodMap = new Map<string, FoodLog[]>();
  for (const item of foodLogs) {
    const current = foodMap.get(item.log_date) || [];
    current.push(item);
    foodMap.set(item.log_date, current);
  }

  const runMap = new Map<string, RunLog[]>();
  for (const item of runLogs) {
    const current = runMap.get(item.log_date) || [];
    current.push(item);
    runMap.set(item.log_date, current);
  }

  const summaries: DaySummary[] = [];
  const today = new Date();

  // Tạo danh sách liên tục các ngày từ hôm nay lùi về quá khứ
  for (let i = 0; i < numDays; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = formatDateKey(targetDate);

    const dayFoods = foodMap.get(dateStr) || [];
    const dayRuns = runMap.get(dateStr) || [];

    const totalIntake = dayFoods.reduce((sum, f) => sum + Number(f.total_calories || 0), 0);
    const totalBurn = dayRuns.reduce((sum, r) => sum + Number(r.calories_burned || 0), 0);
    const totalDistanceKm = dayRuns.reduce((sum, r) => sum + Number(r.distance_km || 0), 0);
    const netCalories = totalIntake - totalBurn;
    const hasLogs = dayFoods.length > 0 || dayRuns.length > 0;

    let metGoals = false;

    if (hasDailyGoals) {
      let intakePass = true;
      let burnPass = true;

      if (activeIntakeGoal) {
        // Phải có log ghi nhận và lượng nạp không vượt quá trần mục tiêu
        intakePass = hasLogs && totalIntake <= activeIntakeGoal.target_value;
      }
      if (activeBurnGoal) {
        // Lượng đốt phải lớn hơn hoặc bằng sàn mục tiêu
        burnPass = totalBurn >= activeBurnGoal.target_value;
      }

      metGoals = intakePass && burnPass;
    } else {
      // Nếu không đặt mục tiêu ngày nào: chỉ cần có ít nhất 1 log trong ngày là đạt
      metGoals = hasLogs;
    }

    summaries.push({
      date: dateStr,
      totalIntake: Math.round(totalIntake),
      totalBurn: Math.round(totalBurn),
      netCalories: Math.round(netCalories),
      totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      hasLogs,
      metGoals,
      foodLogs: dayFoods,
      runLogs: dayRuns,
    });
  }

  return summaries;
}
