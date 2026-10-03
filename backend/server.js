require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const userRoutes = require('./src/routes/userRoutes');
const statRoutes = require('./src/routes/statRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    console.error('LỖI NGHIÊM TRỌNG: JWT_SECRET chưa được thiết lập đúng trong file .env. Vui lòng cấu hình JWT_SECRET an toàn.');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statRoutes);

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
