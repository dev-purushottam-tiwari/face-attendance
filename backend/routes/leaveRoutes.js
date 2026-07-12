const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { applyLeaveValidator } = require('../validators/leaveValidator');

// Employee routes
router.post('/', protect, applyLeaveValidator, validate, ctrl.applyLeave);
router.get('/my', protect, ctrl.myLeaves);

// Admin routes
router.get('/all', protect, authorize('admin'), ctrl.allLeaves);
router.put('/:id/review', protect, authorize('admin'), ctrl.reviewLeave);

module.exports = router;