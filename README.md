# Hệ thống đặt và quản lý phòng học nhóm / phòng học trực tuyến

Đồ án môn "Nhập môn Công nghệ phần mềm".

## Giả định & Quy ước
- CSDL sử dụng SQLite (file `database.sqlite`).
- Mật khẩu mặc định cho các tài khoản seed là `12345678`.
- Lượt đặt phòng trực tuyến sẽ tự động có link (ví dụ: Google Meet/Zoom mock).
- Thời gian hoạt động của hệ thống đặt phòng: 07:00 - 21:00.
- Sinh viên tối đa 2 lượt đặt/ngày, mỗi lượt không quá 3 giờ.

## Cấu trúc thư mục
- `backend/`: Server Node.js + Express, xử lý API và database.
- `frontend/`: Ứng dụng React + Vite.
- `database/`: Chứa file schema (tạo bảng), script tạo seed data.
- `docs/`: Chứa tài liệu dự án.

## Hướng dẫn Backend
### Cài đặt
```bash
cd backend
npm install
```

### Khởi tạo Cơ sở dữ liệu (từ schema và seed data)
```bash
node scripts/init_db.js
```

### Chạy Server
```bash
npm run dev
# Server sẽ chạy tại http://localhost:5000
```

### Các API chính (Tóm tắt)
**Auth**
- `POST /api/auth/register`: Đăng ký
- `POST /api/auth/login`: Đăng nhập
- `GET /api/auth/profile`: Xem hồ sơ
- `PUT /api/auth/profile`: Sửa hồ sơ
- `PUT /api/auth/change-password`: Đổi mật khẩu

**Rooms**
- `GET /api/rooms`: Danh sách phòng (có hỗ trợ query lọc)
- `GET /api/rooms/:id`: Chi tiết phòng (kèm thiết bị và lịch sắp tới)
- `POST /api/rooms` (Admin): Thêm phòng
- `PUT /api/rooms/:id` (Admin): Sửa phòng
- `DELETE /api/rooms/:id` (Admin): Xóa phòng (xóa cứng hoặc mềm)

**Bookings**
- `POST /api/bookings`: Đặt phòng (có transaction bắt trùng lịch và trả về gợi ý)
- `GET /api/bookings/me`: Xem lịch của tôi
- `PUT /api/bookings/:id/cancel`: Hủy lịch đặt
- `GET /api/bookings` (Admin): Xem tất cả lịch đặt
- `PUT /api/bookings/:id/approve` (Admin): Duyệt lịch
- `PUT /api/bookings/:id/reject` (Admin): Từ chối lịch

**Users (Admin)**
- `GET /api/users`: Danh sách user
- `PUT /api/users/:id/toggle-lock`: Khóa/Mở khóa
- `PUT /api/users/:id/role`: Đổi vai trò
- `PUT /api/users/:id/reset-password`: Reset mật khẩu về 12345678

**Stats (Admin)**
- `GET /api/stats/dashboard`: Lấy thống kê tổng quan (phòng, lượt đặt, tỷ lệ hủy, biểu đồ)
