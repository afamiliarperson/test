const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = (req, res) => {
    const { role, search } = req.query;
    let query = 'SELECT id, email, full_name, role, status, created_at FROM users WHERE 1=1';
    let params = [];

    if (role) {
        query += ' AND role = ?';
        params.push(role);
    }
    if (search) {
        query += ' AND (full_name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json(users);
};

const toggleLockUser = (req, res) => {
    const { id } = req.params;
    const user = db.prepare('SELECT status, role FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Không thể khóa admin.' });

    const newStatus = user.status === 'active' ? 'locked' : 'active';
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, id);
    res.json({ message: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} người dùng.` });
};

const changeRole = (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['sinh_vien', 'giang_vien', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Vai trò không hợp lệ.' });
    }
    
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ message: 'Đổi vai trò thành công.' });
};

const resetPassword = (req, res) => {
    const { id } = req.params;
    // Đặt lại thành '12345678'
    const hash = bcrypt.hashSync('12345678', 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id);
    res.json({ message: 'Đã đặt lại mật khẩu thành 12345678.' });
};

module.exports = { getAllUsers, toggleLockUser, changeRole, resetPassword };
