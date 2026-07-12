const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const FaceEmbedding = require('../models/FaceEmbedding');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/email');
const { approvalTemplate, rejectionTemplate } = require('../utils/emailTemplates');

// Helper: Create notification for all admins
const notifyAllAdmins = async (title, message, type, link) => {
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title,
      message,
      type,
      link,
    });
  }
  console.log(`✅ Notification sent to ${admins.length} admin(s): ${title}`);
};

// Helper: Create notification for specific user
const notifyUser = async (userId, title, message, type, link) => {
  await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });
  console.log(`✅ Notification sent to user ${userId}: ${title}`);
};

// GET /admin/stats
exports.dashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalEmployees,
    approvedEmployees,
    pendingRegistrations,
    pendingFaces,
    todayPresent,
    todayLate,
    todayAbsent,
    pendingLeaves,
  ] = await Promise.all([
    User.countDocuments({ role: 'employee' }),
    User.countDocuments({ role: 'employee', isApproved: true }),
    User.countDocuments({ role: 'employee', isApproved: false }),
    FaceEmbedding.countDocuments({ status: 'pending' }),
    Attendance.countDocuments({ date: today, status: 'present' }),
    Attendance.countDocuments({ date: today, status: 'late' }),
    Attendance.countDocuments({ date: today, status: 'absent' }),
    Leave.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    success: true,
    stats: {
      totalEmployees,
      approvedEmployees,
      pendingRegistrations,
      pendingFaces,
      todayPresent,
      todayLate,
      todayAbsent,
      pendingLeaves,
    },
  });
});

// GET /admin/employees
exports.listEmployees = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = { role: 'employee' };
  if (req.query.search) {
    const s = req.query.search;
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { employeeId: { $regex: s, $options: 'i' } },
    ];
  }
  if (req.query.department) filter.department = req.query.department;
  if (req.query.isApproved) filter.isApproved = req.query.isApproved === 'true';
  if (req.query.faceStatus) filter.faceStatus = req.query.faceStatus;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, page, pages: Math.ceil(total / limit), total });
});

// POST /admin/employees/:id/approve
exports.approveEmployee = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  user.isApproved = true;
  user.approvedAt = new Date();
  user.approvedBy = req.user.id;
  await user.save();

  // ✅ Notify employee
  await notifyUser(
    user._id,
    'Account Approved',
    'Your registration has been approved by admin. You can now login.',
    'success',
    '/dashboard'
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Registration Approved',
      html: approvalTemplate(user.name, 'registration'),
    });
  } catch (e) {
    console.warn('Email failed:', e.message);
  }
  
  res.json({ success: true, user });
});

// POST /admin/employees/:id/reject
exports.rejectEmployee = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  user.isActive = false;
  await user.save();

  // ✅ Notify employee
  await notifyUser(
    user._id,
    'Account Rejected',
    `Your registration has been rejected. ${req.body.reason ? 'Reason: ' + req.body.reason : ''}`,
    'error',
    '/login'
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Registration Rejected',
      html: rejectionTemplate(user.name, 'registration', req.body.reason),
    });
  } catch (e) {
    console.warn('Email failed:', e.message);
  }
  
  res.json({ success: true });
});

// GET /admin/faces/pending
exports.pendingFaces = asyncHandler(async (req, res) => {
  const faces = await FaceEmbedding.find({ status: 'pending' })
    .populate('user', 'name employeeId email department designation')
    .sort({ createdAt: -1 });
  res.json({ success: true, faces });
});

// POST /admin/faces/:id/approve
exports.approveFace = asyncHandler(async (req, res) => {
  const face = await FaceEmbedding.findById(req.params.id).populate('user');
  if (!face) return res.status(404).json({ message: 'Face not found' });
  
  face.status = 'approved';
  face.approvedBy = req.user.id;
  face.approvedAt = new Date();
  await face.save();

  const user = await User.findById(face.user._id);
  user.faceStatus = 'approved';
  user.faceApprovedAt = new Date();
  user.faceApprovedBy = req.user.id;
  await user.save();

  // ✅ Notify employee
  await notifyUser(
    user._id,
    'Face Registration Approved',
    'Your face has been approved. You can now check in and out.',
    'success',
    '/dashboard'
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Face Registration Approved',
      html: approvalTemplate(user.name, 'face registration'),
    });
  } catch (e) {
    console.warn('Email failed:', e.message);
  }
  
  res.json({ success: true });
});

// POST /admin/faces/:id/reject
exports.rejectFace = asyncHandler(async (req, res) => {
  const face = await FaceEmbedding.findById(req.params.id).populate('user');
  if (!face) return res.status(404).json({ message: 'Face not found' });
  
  face.status = 'rejected';
  face.rejectionReason = req.body.reason || 'Not specified';
  await face.save();

  const user = await User.findById(face.user._id);
  user.faceStatus = 'rejected';
  user.faceRejectionReason = req.body.reason || 'Not specified';
  await user.save();

  // ✅ Notify employee
  await notifyUser(
    user._id,
    'Face Registration Rejected',
    `Your face registration was rejected. Reason: ${face.rejectionReason}`,
    'error',
    '/face/register'
  );

  try {
    await sendEmail({
      to: user.email,
      subject: 'Face Registration Rejected',
      html: rejectionTemplate(user.name, 'face registration', face.rejectionReason),
    });
  } catch (e) {
    console.warn('Email failed:', e.message);
  }
  
  res.json({ success: true });
});

// GET /admin/attendance/report
exports.attendanceReport = asyncHandler(async (req, res) => {
  const { from, to, department, status } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  if (status) filter.status = status;

  let userFilter = { role: 'employee' };
  if (department) userFilter.department = department;
  const userIds = (await User.find(userFilter).select('_id')).map((u) => u._id);
  filter.user = { $in: userIds };

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('user', 'name employeeId department designation')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);
  res.json({ success: true, records, page, pages: Math.ceil(total / limit), total });
});

// GET /admin/attendance/export
exports.exportAttendanceCsv = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const records = await Attendance.find(filter).populate('user', 'name employeeId department');
  const rows = [['Name', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Hours']];
  for (const r of records) {
    rows.push([
      r.user?.name || '',
      r.user?.employeeId || '',
      r.user?.department || '',
      r.date.toISOString().split('T')[0],
      r.checkIn ? r.checkIn.toISOString() : '',
      r.checkOut ? r.checkOut.toISOString() : '',
      r.status,
      r.workingHours,
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
  res.send(csv);
});