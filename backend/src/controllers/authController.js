const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const register = (req, res) => {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu phải dài tối thiểu 8 ký tự.' });
    }
    
    const roleValue = ['sinh_vien', 'giang_vien'].includes(role) ? role : 'sinh_vien';

    try {
        const hash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare('INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)');
        const result = stmt.run(email, hash, full_name, roleValue);
        res.status(201).json({ message: 'Đăng ký thành công.', userId: result.lastInsertRowid });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email hoặc mã này đã được sử dụng.' });
        }
        res.status(500).json({ error: 'Lỗi server.' });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    }
    if (user.status === 'locked') {
        return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa.' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
        message: 'Đăng nhập thành công.',
        token,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });
};

const getProfile = (req, res) => {
    const user = db.prepare('SELECT id, email, full_name, role, status, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json(user);
};

const updateProfile = (req, res) => {
    const { full_name } = req.body;
    if (!full_name) return res.status(400).json({ error: 'Họ tên không được để trống.' });
    
    db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(full_name, req.user.id);
    res.json({ message: 'Cập nhật hồ sơ thành công.' });
};

const changePassword = (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Mật khẩu mới phải dài tối thiểu 8 ký tự.' });
    }

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(400).json({ error: 'Mật khẩu cũ không chính xác.' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ message: 'Đổi mật khẩu thành công.' });
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
