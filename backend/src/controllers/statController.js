const db = require('../config/db');

const getDashboardStats = (req, res) => {
    // 1. Tổng phòng
    const totalRooms = db.prepare('SELECT count(*) as count FROM rooms').get().count;
    
    // 2. Tổng lượt đặt (không tính đã hủy)
    const totalBookings = db.prepare("SELECT count(*) as count FROM bookings WHERE status != 'da_huy'").get().count;
    
    // 3. Lượt đặt hôm nay
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = db.prepare(`
        SELECT count(*) as count FROM bookings 
        WHERE date(start_time) = ? AND status != 'da_huy'
    `).get(today).count;

    // 4. Tỉ lệ hủy
    const cancelledBookings = db.prepare("SELECT count(*) as count FROM bookings WHERE status = 'da_huy'").get().count;
    const allBookings = db.prepare('SELECT count(*) as count FROM bookings').get().count;
    const cancelRate = allBookings > 0 ? ((cancelledBookings / allBookings) * 100).toFixed(2) : 0;

    // 5. Tần suất từng phòng
    const roomUsage = db.prepare(`
        SELECT r.name, count(b.id) as usage_count
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'da_huy'
        GROUP BY r.id
        ORDER BY usage_count DESC
    `).all();

    // 6. Lượt đặt theo ngày (7 ngày gần nhất)
    const bookingsPerDay = db.prepare(`
        SELECT date(start_time) as date, count(*) as count
        FROM bookings
        WHERE start_time >= date('now', '-7 days') AND status != 'da_huy'
        GROUP BY date(start_time)
        ORDER BY date(start_time) ASC
    `).all();

    res.json({
        totalRooms,
        totalBookings,
        todayBookings,
        cancelRate: parseFloat(cancelRate),
        roomUsage,
        bookingsPerDay
    });
};

module.exports = { getDashboardStats };
