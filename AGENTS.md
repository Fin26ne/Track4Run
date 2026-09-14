# Agent Workspace Rules

## 1. QUY TẮC BẤT DI BẤT DỊCH: KHÔNG BAO GIỜ TỰ Ý COMMIT
- **TUYỆT ĐỐI KHÔNG BAO GIỜ** tự ý chạy `git commit` hoặc `git push` trong bất kỳ hoàn cảnh nào.
- Toàn bộ quyền kiểm soát git do **USER quyết định**. Agent KHÔNG ĐƯỢC PHÉP tự ý commit code lên repository.
- Sau khi hoàn thành tác vụ, Agent chỉ trình bày thay đổi và gợi ý câu lệnh commit để User tự chạy nếu muốn.

## 2. QUY TẮC ĐỊNH DẠNG COMMIT MESSAGE (BẮT BUỘC 3 KIỂU)
Khi đề xuất hoặc chuẩn bị commit, Agent CHỈ được sử dụng đúng 3 tiền tố sau, phân tách bằng dấu gạch chéo `/`:
1. `feat/<tên-commit>`: Dành cho tính năng mới. (Ví dụ: `feat/ai-coach-advice`, `feat/athletic-waveform-animation`)
2. `fix/<tên-commit>`: Dành cho sửa lỗi, vá bug. (Ví dụ: `fix/loading-spinner`, `fix/login-warning`)
3. `migration/<tên-commit>`: Dành cho thay đổi database schema, di chuyển dữ liệu. (Ví dụ: `migration/add-goal-types`)
