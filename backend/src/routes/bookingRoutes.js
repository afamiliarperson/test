const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, bookingController.createBooking);
router.get('/me', authenticate, bookingController.getMyBookings);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Admin routes
router.get('/', authenticate, authorize('admin'), bookingController.getAllBookings);
router.put('/:id/approve', authenticate, authorize('admin'), bookingController.approveBooking);
router.put('/:id/reject', authenticate, authorize('admin'), bookingController.rejectBooking);

module.exports = router;
