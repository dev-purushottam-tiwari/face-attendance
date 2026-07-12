const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { leaveStatusTemplate } = require('../utils/emailTemplates');

// POST /api/leaves
exports.applyLeave = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return res.status(400).json({ message: 'End date before start' });

  const leave = await Leave.create({
    user: req.user.id,
    type,
    startDate: start,
    endDate: end,
    reason,
  });

  // ✅ Create notification for ALL admins
  const admins = await User.find({ role: 'admin' });
  
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title: 'New Leave Request',
      message: `${req.user.name} applied for ${type} leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      type: 'warning',
      link: '/admin/leaves',
    });
  }
  
  console.log(`✅ Leave notification sent to ${admins.length} admin(s)`);

  res.status(201).json({ success: true, leave });
});

// GET /api/leaves/my
exports.myLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

// GET /api/leaves/all (admin)
exports.allLeaves = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.userId) filter.user = req.query.userId;

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('user', 'name employeeId department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);
  res.json({ success: true, leaves, page, pages: Math.ceil(total / limit), total });
});

// PUT /api/leaves/:id/review (admin)
exports.reviewLeave = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  const leave = await Leave.findById(req.params.id).populate('user');
  if (!leave) return res.status(404).json({ message: 'Leave not found' });

  leave.status = status;
  leave.reviewedBy = req.user.id;
  leave.reviewNote = reviewNote;
  leave.reviewedAt = new Date();
  await leave.save();

  // ✅ Create notification for the employee
  await Notification.create({
    user: leave.user._id,
    title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your leave request has been ${status}. ${reviewNote ? 'Note: ' + reviewNote : ''}`,
    type: status === 'approved' ? 'success' : 'error',
    link: '/leaves',
  });

  console.log(`✅ Leave ${status} notification sent to ${leave.user.name}`);

  try {
    await sendEmail({
      to: leave.user.email,
      subject: `Leave Request ${status}`,
      html: leaveStatusTemplate(leave.user.name, status, reviewNote),
    });
  } catch (e) {
    console.warn('Email failed:', e.message);
  }

  res.json({ success: true, leave });
});