-- database/seed.sql

-- Dữ liệu tài khoản (Mật khẩu đều là: 12345678)
INSERT INTO users (email, password, full_name, role, status) VALUES
('admin@demo.com', '$2b$10$IaVOZ62b8d0InXUOAdHhSORkZHrUI50n6l/QVasXAL.pN.wsoXnlO', 'Quản trị viên', 'admin', 'active'),
('gv@demo.com', '$2b$10$IaVOZ62b8d0InXUOAdHhSORkZHrUI50n6l/QVasXAL.pN.wsoXnlO', 'Giảng viên Trần Văn A', 'giang_vien', 'active'),
('sv@demo.com', '$2b$10$IaVOZ62b8d0InXUOAdHhSORkZHrUI50n6l/QVasXAL.pN.wsoXnlO', 'Sinh viên Nguyễn Văn B', 'sinh_vien', 'active');

-- Dữ liệu phòng học (10 phòng)
INSERT INTO rooms (name, type, building, floor, capacity, equipment, description, allowed_roles, status) VALUES
('Phòng họp nhóm 101', 'nhom', 'Tòa A', 1, 10, 'Bảng trắng, Tivi', 'Phòng họp nhóm nhỏ', 'sinh_vien,giang_vien', 'hoat_dong'),
('Phòng họp nhóm 102', 'nhom', 'Tòa A', 1, 15, 'Bảng trắng, Máy chiếu', 'Phòng họp nhóm vừa', 'sinh_vien,giang_vien', 'hoat_dong'),
('Phòng họp nhóm 103', 'nhom', 'Tòa A', 1, 5, 'Bảng trắng', 'Phòng học cá nhân/nhóm siêu nhỏ', 'sinh_vien,giang_vien', 'hoat_dong'),
('Phòng chuyên đề 201', 'nhom', 'Tòa B', 2, 30, 'Bảng trắng, Máy chiếu, Âm thanh', 'Phòng sinh hoạt chuyên đề', 'giang_vien', 'hoat_dong'),
('Phòng chuyên đề 202', 'nhom', 'Tòa B', 2, 25, 'Bảng trắng, Máy chiếu', 'Phòng thảo luận', 'giang_vien', 'bao_tri'),
('Phòng nghiên cứu 301', 'nhom', 'Tòa C', 3, 8, 'Tivi, Bảng tương tác', 'Dành riêng cho giảng viên', 'giang_vien', 'hoat_dong'),
('Phòng trực tuyến 1', 'truc_tuyen', '', 0, 50, 'Zoom Pro', 'Phòng học trực tuyến sức chứa 50', 'sinh_vien,giang_vien', 'hoat_dong'),
('Phòng trực tuyến 2', 'truc_tuyen', '', 0, 100, 'Google Meet', 'Phòng học trực tuyến sức chứa 100', 'sinh_vien,giang_vien', 'hoat_dong'),
('Phòng trực tuyến 3 (VIP)', 'truc_tuyen', '', 0, 300, 'Webex', 'Phòng hội thảo trực tuyến lớn', 'giang_vien', 'hoat_dong'),
('Phòng họp nhóm 104', 'nhom', 'Tòa A', 1, 12, 'Bảng trắng', 'Phòng họp nhóm', 'sinh_vien,giang_vien', 'hoat_dong');

-- Dữ liệu lượt đặt phòng (30 lượt mẫu)
-- Lượt của sinh viên (user_id = 3)
INSERT INTO bookings (user_id, room_id, start_time, end_time, attendees, purpose, note, status) VALUES
(3, 1, datetime('now', '+1 days', '08:00:00'), datetime('now', '+1 days', '10:00:00'), 5, 'Học nhóm môn CNPM', '', 'da_duyet'),
(3, 2, datetime('now', '+1 days', '13:00:00'), datetime('now', '+1 days', '15:00:00'), 8, 'Thảo luận đồ án', '', 'cho_duyet'),
(3, 3, datetime('now', '+2 days', '09:00:00'), datetime('now', '+2 days', '11:00:00'), 4, 'Ôn thi cuối kỳ', '', 'tu_choi'),
(3, 1, datetime('now', '-1 days', '08:00:00'), datetime('now', '-1 days', '10:00:00'), 5, 'Học nhóm', '', 'hoan_thanh'),
(3, 7, datetime('now', '+3 days', '18:00:00'), datetime('now', '+3 days', '20:00:00'), 10, 'Họp CLB', '', 'cho_duyet'),
(3, 10, datetime('now', '+2 days', '14:00:00'), datetime('now', '+2 days', '16:00:00'), 6, 'Học nhóm', '', 'da_huy'),
(3, 1, datetime('now', '+4 days', '07:30:00'), datetime('now', '+4 days', '09:30:00'), 5, 'Báo cáo', '', 'da_duyet'),
(3, 2, datetime('now', '+4 days', '15:00:00'), datetime('now', '+4 days', '17:00:00'), 8, 'Làm bài tập', '', 'cho_duyet'),
(3, 7, datetime('now', '+5 days', '19:00:00'), datetime('now', '+5 days', '21:00:00'), 12, 'Họp team', '', 'da_duyet'),
(3, 1, datetime('now', '-2 days', '08:00:00'), datetime('now', '-2 days', '10:00:00'), 4, 'Học nhóm', '', 'hoan_thanh'),

-- Lượt của giảng viên (user_id = 2)
(2, 4, datetime('now', '+1 days', '08:00:00'), datetime('now', '+1 days', '11:00:00'), 25, 'Giảng dạy', 'Chuẩn bị máy chiếu', 'da_duyet'),
(2, 6, datetime('now', '+1 days', '14:00:00'), datetime('now', '+1 days', '16:00:00'), 4, 'Hướng dẫn sinh viên', '', 'da_duyet'),
(2, 8, datetime('now', '+2 days', '09:00:00'), datetime('now', '+2 days', '11:00:00'), 60, 'Dạy online', '', 'da_duyet'),
(2, 4, datetime('now', '-3 days', '13:00:00'), datetime('now', '-3 days', '15:00:00'), 30, 'Họp bộ môn', '', 'hoan_thanh'),
(2, 9, datetime('now', '+3 days', '18:00:00'), datetime('now', '+3 days', '20:00:00'), 150, 'Hội thảo khoa học', 'Cần hỗ trợ kỹ thuật', 'cho_duyet'),
(2, 6, datetime('now', '+5 days', '09:00:00'), datetime('now', '+5 days', '11:00:00'), 2, 'Gặp mặt nghiên cứu sinh', '', 'da_duyet'),
(2, 4, datetime('now', '+6 days', '08:00:00'), datetime('now', '+6 days', '11:00:00'), 20, 'Dạy bù', '', 'da_duyet'),
(2, 8, datetime('now', '+7 days', '13:00:00'), datetime('now', '+7 days', '15:30:00'), 80, 'Kiểm tra giữa kỳ', '', 'da_duyet'),
(2, 6, datetime('now', '-1 days', '14:00:00'), datetime('now', '-1 days', '16:00:00'), 3, 'Họp nhóm NCKH', '', 'hoan_thanh'),
(2, 4, datetime('now', '+8 days', '15:00:00'), datetime('now', '+8 days', '17:00:00'), 25, 'Sinh hoạt chuyên đề', '', 'cho_duyet'),

-- Thêm lượt đặt để đủ 30
(3, 10, datetime('now', '+6 days', '08:00:00'), datetime('now', '+6 days', '10:00:00'), 5, 'Học nhóm', '', 'da_duyet'),
(3, 1, datetime('now', '+7 days', '09:00:00'), datetime('now', '+7 days', '10:30:00'), 4, 'Học tiếng Anh', '', 'cho_duyet'),
(3, 2, datetime('now', '+8 days', '14:00:00'), datetime('now', '+8 days', '16:00:00'), 7, 'Thảo luận', '', 'da_duyet'),
(3, 7, datetime('now', '+9 days', '20:00:00'), datetime('now', '+9 days', '21:00:00'), 15, 'Họp nhóm online', '', 'cho_duyet'),
(3, 1, datetime('now', '-4 days', '13:00:00'), datetime('now', '-4 days', '15:00:00'), 6, 'Học nhóm', '', 'hoan_thanh'),
(3, 10, datetime('now', '-5 days', '08:00:00'), datetime('now', '-5 days', '11:00:00'), 8, 'Học nhóm', '', 'hoan_thanh'),
(2, 6, datetime('now', '+9 days', '08:00:00'), datetime('now', '+9 days', '11:00:00'), 4, 'Nghiên cứu', '', 'da_duyet'),
(2, 8, datetime('now', '+10 days', '18:00:00'), datetime('now', '+10 days', '20:00:00'), 50, 'Bồi dưỡng nghiệp vụ', '', 'cho_duyet'),
(2, 4, datetime('now', '-5 days', '08:00:00'), datetime('now', '-5 days', '11:00:00'), 30, 'Giảng dạy', '', 'hoan_thanh'),
(3, 3, datetime('now', '+10 days', '08:00:00'), datetime('now', '+10 days', '10:00:00'), 3, 'Ôn tập', '', 'tu_choi');

-- Cập nhật meeting_link cho các phòng trực tuyến đã được duyệt/chờ duyệt/hoàn thành
UPDATE bookings SET meeting_link = 'https://meet.google.com/abc-defg-hij' WHERE room_id IN (7, 8, 9);
