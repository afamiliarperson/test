const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomDetails);

// Các thao tác admin
router.post('/', authenticate, authorize('admin'), roomController.createRoom);
router.put('/:id', authenticate, authorize('admin'), roomController.updateRoom);
router.delete('/:id', authenticate, authorize('admin'), roomController.deleteRoom);

module.exports = router;
