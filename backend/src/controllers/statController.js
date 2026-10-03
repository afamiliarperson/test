const db = require('../config/db');

const getDashboardStats = (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Base condition for bookings
    let dateCondition = "1=1";
    let params = [];
    if (startDate && endDate) {
        dateCondition = "date(start_time) >= ? AND date(start_time) <= ?";
        params.push(startDate, endDate);
    }

    // 1. Tổng phòng
    const totalRooms = db.prepare('SELECT count(*) as count FROM rooms').get().count;
    
    // 2. Tổng lượt đặt (không tính đã hủy)
    const totalBookings = db.prepare(`SELECT count(*) as count FROM bookings WHERE status != 'da_huy' AND ${dateCondition}`).get(...params).count;
    
    // 3. Lượt đặt hôm nay
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = db.prepare(`
        SELECT count(*) as count FROM bookings 
        WHERE date(start_time) = ? AND status != 'da_huy'
    `).get(today).count;

    // 4. Tỉ lệ hủy
    const cancelledBookings = db.prepare(`SELECT count(*) as count FROM bookings WHERE status = 'da_huy' AND ${dateCondition}`).get(...params).count;
    const allBookings = db.prepare(`SELECT count(*) as count FROM bookings WHERE ${dateCondition}`).get(...params).count;
    const cancelRate = allBookings > 0 ? ((cancelledBookings / allBookings) * 100).toFixed(2) : 0;

    // 5. Tần suất từng phòng
    const roomUsage = db.prepare(`
        SELECT r.name, count(b.id) as usage_count
        FROM rooms r
        LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'da_huy' AND ${dateCondition.replace(/start_time/g, 'b.start_time')}
        GROUP BY r.id
        ORDER BY usage_count DESC
        LIMIT 10
    `).all(...params);

    // 6. Lượt đặt theo ngày
    let dayQuery = `
        SELECT date(start_time) as date, count(*) as count
        FROM bookings
        WHERE status != 'da_huy' AND ${dateCondition}
        GROUP BY date(start_time)
        ORDER BY date(start_time) ASC
    `;
    if (!startDate) {
        dayQuery = `
            SELECT date(start_time) as date, count(*) as count
            FROM bookings
            WHERE start_time >= date('now', '-7 days') AND status != 'da_huy'
            GROUP BY date(start_time)
            ORDER BY date(start_time) ASC
        `;
    }
    const bookingsPerDay = db.prepare(dayQuery).all(...(startDate ? params : []));

    // 7. Khung giờ cao điểm
    const peakHours = db.prepare(`
        SELECT strftime('%H:00', start_time) as hour, count(*) as count
        FROM bookings
        WHERE status != 'da_huy' AND ${dateCondition}
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 5
    `).all(...params);

    // 8. Lượt đặt theo vai trò
    const bookingsByRole = db.prepare(`
        SELECT u.role, count(b.id) as count
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.status != 'da_huy' AND ${dateCondition.replace(/start_time/g, 'b.start_time')}
        GROUP BY u.role
    `).all(...params);

    res.json({
        totalRooms,
        totalBookings,
        todayBookings,
        cancelRate: parseFloat(cancelRate),
        roomUsage,
        bookingsPerDay,
        peakHours,
        bookingsByRole
    });
};

module.exports = { getDashboardStats };
