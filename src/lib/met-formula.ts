import { ManualRunInput, RunCalorieResult } from "./types";

/**
 * Tính toán calo tiêu thụ và các chỉ số sinh lý khi chạy bộ
 * dựa trên Phương trình Chuyển hóa Năng lượng ACSM (American College of Sports Medicine).
 *
 * @param input Các thông số: quãng đường (km), thời gian (phút), cân nặng (kg)
 * @returns RunCalorieResult gồm calo, vận tốc, VO2, MET và calo/phút
 */
export function calculateRunningCalories(input: ManualRunInput): RunCalorieResult {
  const { distanceKm, durationMinutes, weightKg } = input;

  // Xử lý dữ liệu không hợp lệ hoặc bằng 0
  if (distanceKm <= 0 || durationMinutes <= 0 || weightKg <= 0) {
    return {
      speedKmH: 0,
      speedMPerMin: 0,
      vo2: 3.5,
      met: 1,
      kcalPerMinute: 0,
      totalCaloriesBurned: 0,
      warning: "Vui lòng nhập quãng đường, thời gian và cân nặng lớn hơn 0.",
    };
  }

  // 1. Tính vận tốc theo km/h
  const speedKmH = distanceKm / (durationMinutes / 60);

  // 2. Chuyển đổi vận tốc sang mét/phút (đơn vị chuẩn của công thức ACSM)
  // 1 km = 1000m, 1 giờ = 60 phút
  const speedMPerMin = (speedKmH * 1000) / 60;

  // 3. Phương trình chuyển hóa ACSM cho chạy bộ:
  // VO2 (ml/kg/min) = 0.2 * speedMPerMin + 3.5
  // Hệ số 0.2: Chi phí oxy cho vận động ngang khi chạy (ml O2 / kg / m)
  // 3.5: Lượng oxy tiêu thụ cơ bản lúc nghỉ ngơi (Resting VO2)
  const vo2 = 0.2 * speedMPerMin + 3.5;

  // 4. Chỉ số MET (Metabolic Equivalent of Task)
  // 1 MET = 3.5 ml O2 / kg / min
  const met = vo2 / 3.5;

  // 5. Tốc độ tiêu thụ calo mỗi phút:
  // kcal/phút = (MET * 3.5 * weightKg) / 200
  // Xuất phát từ công thức: (VO2 * weightKg / 1000) * 5 kcal/L O2
  const kcalPerMinute = (met * 3.5 * weightKg) / 200;

  // 6. Tổng calo tiêu thụ
  const totalCaloriesBurned = kcalPerMinute * durationMinutes;

  // 7. Kiểm tra ngưỡng độ chính xác của công thức ACSM Running
  let warning: string | undefined;
  if (speedKmH < 5) {
    warning =
      "Vận tốc hiện tại < 5 km/h: Phương trình ACSM Running chính xác nhất khi chạy với vận tốc từ 5 km/h trở lên. Ở tốc độ này, kết quả có thể chênh lệch nhẹ do cơ chế đi bộ.";
  }

  return {
    speedKmH: Math.round(speedKmH * 100) / 100,
    speedMPerMin: Math.round(speedMPerMin * 100) / 100,
    vo2: Math.round(vo2 * 100) / 100,
    met: Math.round(met * 100) / 100,
    kcalPerMinute: Math.round(kcalPerMinute * 100) / 100,
    totalCaloriesBurned: Math.round(totalCaloriesBurned),
    warning,
  };
}

/**
 * Chuyển đổi Pace (phút, giây trên mỗi km) và Quãng đường (km)
 * thành Tổng thời gian chạy (phút) để đưa vào công thức ACSM.
 *
 * @param distanceKm Quãng đường (km)
 * @param paceMinutes Số phút của pace (ví dụ: 5)
 * @param paceSeconds Số giây của pace (ví dụ: 30)
 * @returns Tổng thời gian chạy tính theo phút (số thập phân)
 */
export function paceToDurationMinutes(
  distanceKm: number,
  paceMinutes: number,
  paceSeconds: number
): number {
  if (distanceKm <= 0 || (paceMinutes <= 0 && paceSeconds <= 0)) {
    return 0;
  }
  const paceDecimal = paceMinutes + (paceSeconds || 0) / 60;
  return Math.round(distanceKm * paceDecimal * 100) / 100;
}

/**
 * Chuyển đổi Tổng thời gian (phút) và Quãng đường (km)
 * thành chuỗi Pace định dạng quen thuộc của runner (ví dụ: "5:30 /km").
 *
 * @param distanceKm Quãng đường (km)
 * @param durationMinutes Tổng thời gian chạy (phút)
 * @returns Chuỗi Pace chuẩn (ví dụ "5:30 /km")
 */
export function durationToPaceString(
  distanceKm: number,
  durationMinutes: number
): string {
  if (distanceKm <= 0 || durationMinutes <= 0) {
    return "--:-- /km";
  }
  const paceDecimal = durationMinutes / distanceKm;
  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);

  // Xử lý trường hợp làm tròn giây thành 60
  if (seconds === 60) {
    return `${minutes + 1}:00 /km`;
  }

  const formattedSec = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${formattedSec} /km`;
}

