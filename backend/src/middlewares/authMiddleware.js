const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware xác thực JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Không có token hoặc token không hợp lệ.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        
        // Kiểm tra xem user có bị khóa không
        const user = db.prepare('SELECT status, role FROM users WHERE id = ?').get(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại.' });
        }
        if (user.status === 'locked') {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
        }

        req.user = { id: decoded.id, role: user.role };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token đã hết hạn hoặc không hợp lệ.' });
    }
};

// Middleware phân quyền
const authorize = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này.' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
