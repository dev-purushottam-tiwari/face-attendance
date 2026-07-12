const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get all notifications for current user
router.get('/', ctrl.myNotifications);

// POST /api/notifications/read - Mark notifications as read
router.post('/read', ctrl.markRead);

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;