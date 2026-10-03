const db = require('../config/db');

const getAllRooms = (req, res) => {
    // API lấy danh sách phòng có lọc (sức chứa, loại, tòa...)
    const { capacity, type, building, all } = req.query;
    
    let query = "SELECT * FROM rooms WHERE 1=1";
    let params = [];

    // Nếu không có param all=true, chỉ hiện phòng hoạt động hoặc bảo trì, ẩn ngưng sử dụng
    if (!all) {
        query += " AND status != 'ngung_su_dung'";
    }

    if (capacity) {
        query += ' AND capacity >= ?';
        params.push(parseInt(capacity));
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    if (building) {
        query += ' AND building = ?';
        params.push(building);
    }

    const rooms = db.prepare(query).all(...params);

    // Lấy thiết bị cho mỗi phòng
    rooms.forEach(room => {
        const eq = db.prepare(`
            SELECT e.id, e.name FROM equipment e
            JOIN room_equipment re ON e.id = re.equipment_id
            WHERE re.room_id = ?
        `).all(room.id);
        room.equipment = eq;
    });

    res.json(rooms);
};

const getRoomDetails = (req, res) => {
    const { id } = req.params;
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng.' });

    room.equipment = db.prepare(`
        SELECT e.id, e.name FROM equipment e
        JOIN room_equipment re ON e.id = re.equipment_id
        WHERE re.room_id = ?
    `).all(room.id);

    // Lấy lịch sử dụng sắp tới (status: chờ duyệt, đã duyệt)
    room.upcoming_bookings = db.prepare(`
        SELECT start_time, end_time, status 
        FROM bookings 
        WHERE room_id = ? AND end_time > datetime('now') AND status IN ('cho_duyet', 'da_duyet')
        ORDER BY start_time ASC
    `).all(room.id);

    res.json(room);
};

const createRoom = (req, res) => {
    const { name, type, building, floor, capacity, description, allowed_roles, equipments } = req.body;
    
    const trx = db.transaction(() => {
        const stmt = db.prepare(`
            INSERT INTO rooms (name, type, building, floor, capacity, description, allowed_roles) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(name, type, building, floor, capacity, description, allowed_roles);
        const roomId = result.lastInsertRowid;

        if (equipments && equipments.length > 0) {
            const insertEq = db.prepare('INSERT INTO room_equipment (room_id, equipment_id) VALUES (?, ?)');
            for (let eqId of equipments) {
                insertEq.run(roomId, eqId);
            }
        }
        return roomId;
    });

    try {
        const id = trx();
        res.status(201).json({ message: 'Thêm phòng thành công.', roomId: id });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi thêm phòng.' });
    }
};

const updateRoom = (req, res) => {
    const { id } = req.params;
    const { name, type, building, floor, capacity, description, allowed_roles, status, equipments } = req.body;

    const trx = db.transaction(() => {
        db.prepare(`
            UPDATE rooms SET name = ?, type = ?, building = ?, floor = ?, capacity = ?, description = ?, allowed_roles = ?, status = ?
            WHERE id = ?
        `).run(name, type, building, floor, capacity, description, allowed_roles, status, id);
        
        // Update equipments
        if (equipments !== undefined) {
            db.prepare('DELETE FROM room_equipment WHERE room_id = ?').run(id);
            if (equipments.length > 0) {
                const insertEq = db.prepare('INSERT INTO room_equipment (room_id, equipment_id) VALUES (?, ?)');
                for (let eqId of equipments) {
                    insertEq.run(id, eqId);
                }
            }
        }
    });

    try {
        trx();
        res.json({ message: 'Cập nhật phòng thành công.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi cập nhật phòng.' });
    }
};

const deleteRoom = (req, res) => {
    const { id } = req.params;
    const bookingCount = db.prepare('SELECT count(*) as count FROM bookings WHERE room_id = ?').get(id).count;
    
    if (bookingCount > 0) {
        // Xóa mềm
        db.prepare("UPDATE rooms SET status = 'ngung_su_dung' WHERE id = ?").run(id);
        res.json({ message: 'Phòng đã có lượt đặt, chuyển trạng thái thành Ngừng sử dụng (Xóa mềm).' });
    } else {
        // Xóa cứng
        const trx = db.transaction(() => {
            db.prepare('DELETE FROM room_equipment WHERE room_id = ?').run(id);
            db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
        });
        trx();
        res.json({ message: 'Xóa phòng thành công.' });
    }
};

const getAllEquipments = (req, res) => {
    const eq = db.prepare('SELECT * FROM equipment').all();
    res.json(eq);
};

module.exports = { getAllRooms, getRoomDetails, createRoom, updateRoom, deleteRoom, getAllEquipments };
