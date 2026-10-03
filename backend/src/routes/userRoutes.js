const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate, authorize('admin'));

router.get('/', userController.getAllUsers);
router.put('/:id/toggle-lock', userController.toggleLockUser);
router.put('/:id/role', userController.changeRole);
router.put('/:id/reset-password', userController.resetPassword);

module.exports = router;
