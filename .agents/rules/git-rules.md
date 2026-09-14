# Git Commitment & Message Rules

## QUY TẮC CỐT LÕI: KHÔNG BAO GIỜ TỰ Ý COMMIT
1. **NGHIÊM CẤM TỰ ĐỘNG CHẠY `git commit` HOẶC `git push`**:
   - Agent tuyệt đối không bao giờ được tự ý commit hoặc push code.
   - Chỉ được commit khi USER yêu cầu trực tiếp bằng câu lệnh rõ ràng.
   - Sau khi code xong, Agent chỉ trình bày code và ghi rõ gợi ý commit để User tự xem xét và tự quyết định.

2. **ĐỊNH DẠNG COMMIT BẮT BUỘC (3 KIỂU THEO DẠNG `<tiền_tố>/<tên_commit>`)**:
   Khi đưa ra gợi ý commit message cho User, chỉ được dùng 3 kiểu sau:
   - `feat/<tên commit>`: Cho tính năng hoặc giao diện mới.
   - `fix/<tên commit>`: Cho việc sửa lỗi, khắc phục bug hoặc điều chỉnh logic.
   - `migration/<tên commit>`: Cho việc thay đổi cấu trúc database, cập nhật migration hoặc env.
