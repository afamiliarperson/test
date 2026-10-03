-- database/schema.sql

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('sinh_vien', 'giang_vien', 'admin')) NOT NULL DEFAULT 'sinh_vien',
    status TEXT CHECK(status IN ('active', 'locked')) NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('nhom', 'truc_tuyen')) NOT NULL,
    building TEXT,
    floor INTEGER,
    capacity INTEGER NOT NULL,
    equipment TEXT, 
    description TEXT,
    allowed_roles TEXT NOT NULL, 
    status TEXT CHECK(status IN ('hoat_dong', 'bao_tri', 'ngung_su_dung')) NOT NULL DEFAULT 'hoat_dong',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    attendees INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    note TEXT,
    meeting_link TEXT,
    status TEXT CHECK(status IN ('cho_duyet', 'da_duyet', 'tu_choi', 'da_huy', 'hoan_thanh')) NOT NULL DEFAULT 'cho_duyet',
    reject_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Tạo index để tăng tốc độ kiểm tra trùng lịch và lọc
CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON bookings (room_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
