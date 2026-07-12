const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { reportQueryValidator } = require('../validators/attendanceValidator');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', ctrl.dashboardStats);

// Employee management
router.get('/employees', ctrl.listEmployees);
router.post('/employees/:id/approve', ctrl.approveEmployee);
router.post('/employees/:id/reject', ctrl.rejectEmployee);

// Face registration approvals
router.get('/faces/pending', ctrl.pendingFaces);
router.post('/faces/:id/approve', ctrl.approveFace);
router.post('/faces/:id/reject', ctrl.rejectFace);

// Attendance reports
router.get('/attendance/report', reportQueryValidator, validate, ctrl.attendanceReport);
router.get('/attendance/export', ctrl.exportAttendanceCsv);

// ❌ REMOVED: Leave routes are already in leaveRoutes.js
// router.get('/leaves/all', ctrl.allLeaves);        ← This caused the error
// router.put('/leaves/:id/review', ctrl.reviewLeave); ← This caused the error

module.exports = router;