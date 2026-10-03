const db = require('../config/db');

const createBooking = (req, res) => {
    const { room_id, start_time, end_time, attendees, purpose, note } = req.body;
    const user_id = req.user.id;
    const role = req.user.role;

    // 1. Kiểm tra thời gian cơ bản
    const start = new Date(start_time);
    const end = new Date(end_time);
    const now = new Date();

    if (start < now) return res.status(400).json({ error: 'Không thể đặt phòng trong quá khứ.' });
    if (end <= start) return res.status(400).json({ error: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
    
    // Tối đa 3 giờ/lượt
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours > 3) return res.status(400).json({ error: 'Chỉ được đặt tối đa 3 giờ mỗi lượt.' });

    // Giờ mở cửa 07:00 - 21:00
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    if (startHour < 7 || endHour > 21) {
        return res.status(400).json({ error: 'Hệ thống chỉ cho phép đặt phòng từ 07:00 đến 21:00.' });
    }

    // Lấy thông tin phòng
    const room = db.prepare('SELECT capacity, allowed_roles, type, status FROM rooms WHERE id = ?').get(room_id);
    if (!room) return res.status(404).json({ error: 'Phòng không tồn tại.' });
    if (room.status !== 'hoat_dong') return res.status(400).json({ error: 'Phòng đang không hoạt động.' });
    
    if (attendees > room.capacity) {
        return res.status(400).json({ error: `Số người vượt quá sức chứa của phòng (${room.capacity} người).` });
    }

    // Phân quyền đặt phòng (Sinh viên không được đặt phòng dành riêng cho giảng viên)
    if (role === 'sinh_vien' && !room.allowed_roles.includes('sinh_vien')) {
        return res.status(403).json({ error: 'Sinh viên không được phép đặt phòng này.' });
    }

    // Kiểm tra giới hạn 2 lượt/ngày cho sinh viên
    if (role === 'sinh_vien') {
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(start);
        endOfDay.setHours(23, 59, 59, 999);

        const countToday = db.prepare(`
            SELECT count(*) as count FROM bookings 
            WHERE user_id = ? AND status IN ('cho_duyet', 'da_duyet', 'hoan_thanh')
            AND datetime(start_time) >= datetime(?) AND datetime(start_time) <= datetime(?)
        `).get(user_id, startOfDay.toISOString(), endOfDay.toISOString()).count;

        if (countToday >= 2) {
            return res.status(400).json({ error: 'Sinh viên chỉ được đặt tối đa 2 lượt mỗi ngày.' });
        }
    }

    // 2. Transaction kiểm tra trùng lịch (quan trọng) và chèn dữ liệu
    try {
        const createTx = db.transaction(() => {
            // Tìm các lượt đặt trùng (a.start < b.end AND a.end > b.start)
            const overlap = db.prepare(`
                SELECT start_time, end_time FROM bookings 
                WHERE room_id = ? 
                  AND status IN ('cho_duyet', 'da_duyet')
                  AND datetime(start_time) < datetime(?) 
                  AND datetime(end_time) > datetime(?)
            `).get(room_id, end_time, start_time);

            if (overlap) {
                // Trả về lỗi đặc biệt để throw ra ngoài
                throw { code: 'OVERLAP', overlap };
            }

            const stmt = db.prepare(`
                INSERT INTO bookings (user_id, room_id, start_time, end_time, attendees, purpose, note, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'cho_duyet')
            `);
            const result = stmt.run(user_id, room_id, start_time, end_time, attendees, purpose, note);
            return result.lastInsertRowid;
        });

        const bookingId = createTx();
        res.status(201).json({ message: 'Đặt phòng thành công. Vui lòng chờ duyệt.', bookingId });

    } catch (err) {
        if (err.code === 'OVERLAP') {
            // Gợi ý phòng trống (Cùng sức chứa, cùng khung giờ)
            const availableRooms = db.prepare(`
                SELECT r.id, r.name FROM rooms r
                WHERE r.status = 'hoat_dong' AND r.capacity >= ? AND r.allowed_roles LIKE '%' || ? || '%'
                AND r.id NOT IN (
                    SELECT room_id FROM bookings
                    WHERE status IN ('cho_duyet', 'da_duyet')
                      AND datetime(start_time) < datetime(?) 
                      AND datetime(end_time) > datetime(?)
                )
                LIMIT 5
            `).all(attendees, role, end_time, start_time);

            return res.status(409).json({ 
                error: `Phòng đã bị đặt trong khoảng thời gian từ ${err.overlap.start_time} đến ${err.overlap.end_time}.`,
                suggestions: availableRooms
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Lỗi server khi đặt phòng.' });
    }
};

const getMyBookings = (req, res) => {
    const { filter } = req.query;
    let query = `
        SELECT b.*, r.name as room_name, r.type as room_type 
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = ?
    `;

    if (filter === 'upcoming') {
        query += ` AND b.status IN ('cho_duyet', 'da_duyet') AND datetime(b.start_time) >= datetime('now')`;
        query += ` ORDER BY b.start_time ASC`;
    } else if (filter === 'past') {
        query += ` AND (b.status = 'hoan_thanh' OR (b.status IN ('cho_duyet', 'da_duyet') AND datetime(b.end_time) < datetime('now')))`;
        query += ` ORDER BY b.start_time DESC`;
    } else if (filter === 'cancelled') {
        query += ` AND b.status IN ('da_huy', 'tu_choi')`;
        query += ` ORDER BY b.start_time DESC`;
    } else {
        query += ` ORDER BY b.start_time DESC`;
    }

    const bookings = db.prepare(query).all(req.user.id);
    res.json(bookings);
};

const cancelBooking = (req, res) => {
    const { id } = req.params;
    const booking = db.prepare('SELECT start_time, status, user_id FROM bookings WHERE id = ?').get(id);

    if (!booking) return res.status(404).json({ error: 'Không tìm thấy lượt đặt.' });
    
    // Admin có thể hủy mọi lượt. User chỉ hủy được của mình.
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Bạn không có quyền hủy lượt đặt này.' });
    }

    if (!['cho_duyet', 'da_duyet'].includes(booking.status)) {
        return res.status(400).json({ error: 'Chỉ có thể hủy lượt đặt đang chờ duyệt hoặc đã duyệt.' });
    }

    // Chỉ hủy khi trước ít nhất 1 giờ
    const start = new Date(booking.start_time);
    const now = new Date();
    const diffHours = (start - now) / (1000 * 60 * 60);

    if (diffHours < 1 && req.user.role !== 'admin') {
        return res.status(400).json({ error: 'Phải hủy lịch trước giờ bắt đầu ít nhất 1 tiếng.' });
    }

    db.prepare("UPDATE bookings SET status = 'da_huy' WHERE id = ?").run(id);
    res.json({ message: 'Hủy lịch thành công.' });
};

// --- API Admin ---
const getAllBookings = (req, res) => {
    const bookings = db.prepare(`
        SELECT b.*, r.name as room_name, u.full_name as user_name, u.email
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.start_time DESC
    `).all();
    res.json(bookings);
};

const approveBooking = (req, res) => {
    const { id } = req.params;
    db.prepare("UPDATE bookings SET status = 'da_duyet' WHERE id = ? AND status = 'cho_duyet'").run(id);
    res.json({ message: 'Duyệt thành công.' });
};

const rejectBooking = (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    db.prepare("UPDATE bookings SET status = 'tu_choi', reject_reason = ? WHERE id = ?").run(reason || 'Không có lý do', id);
    res.json({ message: 'Từ chối thành công.' });
};

module.exports = { createBooking, getMyBookings, cancelBooking, getAllBookings, approveBooking, rejectBooking };
