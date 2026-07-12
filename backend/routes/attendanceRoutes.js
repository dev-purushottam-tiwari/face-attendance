const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { checkInValidator, checkOutValidator } = require('../validators/attendanceValidator');

router.post('/checkin', protect, checkInValidator, validate, ctrl.checkIn);
router.post('/checkout', protect, checkOutValidator, validate, ctrl.checkOut);
router.get('/today', protect, ctrl.todayAttendance);
router.get('/history', protect, ctrl.history);
router.get('/stats', protect, ctrl.stats);

module.exports = router;