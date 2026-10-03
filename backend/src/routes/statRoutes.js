const express = require('express');
const router = express.Router();
const statController = require('../controllers/statController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/dashboard', authenticate, authorize('admin'), statController.getDashboardStats);

module.exports = router;
