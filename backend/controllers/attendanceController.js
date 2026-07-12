const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const FaceEmbedding = require('../models/FaceEmbedding');
const User = require('../models/User');

// Get current time in IST
const getISTTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (5.5 * 3600000)); // IST = UTC + 5:30
  return istTime;
};

const startOfISTDay = () => {
  const ist = getISTTime();
  ist.setHours(0, 0, 0, 0);
  return ist;
};

// IST Time restriction
const checkTimeRestriction = (type) => {
  const ist = getISTTime();
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (type === 'checkin') {
    // Check-in allowed: 6:00 AM IST to 11:30 AM IST
    const minTime = 6 * 60;       // 6:00 AM
    const maxTime = 11 * 60 + 30; // 11:30 AM
    
    if (totalMinutes < minTime) {
      return { allowed: false, message: `Check-in not allowed before 6:00 AM IST. Current time: ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST` };
    }
    if (totalMinutes > maxTime) {
      return { allowed: false, message: `Check-in not allowed after 11:30 AM IST. Current time: ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST` };
    }
  }

  if (type === 'checkout') {
    // Check-out allowed: 12:00 PM IST to 11:00 PM IST
    const minTime = 12 * 60;      // 12:00 PM
    const maxTime = 23 * 60;      // 11:00 PM
    
    if (totalMinutes < minTime) {
      return { allowed: false, message: `Check-out not allowed before 12:00 PM IST. Current time: ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST` };
    }
    if (totalMinutes > maxTime) {
      return { allowed: false, message: `Check-out not allowed after 11:00 PM IST. Current time: ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST` };
    }
  }

  return { allowed: true, istTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')} IST` };
};

const computeStatus = (checkIn) => {
  const ist = new Date(checkIn);
  const startH = Number(process.env.OFFICE_START_HOUR || 9);
  const startM = Number(process.env.OFFICE_START_MIN || 0);
  const lateThreshold = Number(process.env.LATE_THRESHOLD_MIN || 15);
  const limit = new Date(ist);
  limit.setHours(startH, startM + lateThreshold, 0, 0);
  return ist > limit ? 'late' : 'present';
};

const euclideanDistance = (desc1, desc2) => {
  if (!desc1 || !desc2 || desc1.length !== 128 || desc2.length !== 128) {
    throw new Error('Invalid descriptor format');
  }
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const findMatchingFace = async (descriptor, userId) => {
  const userFace = await FaceEmbedding.findOne({
    user: userId,
    status: 'approved',
  });

  if (!userFace) {
    return { match: false, reason: 'No approved face registration found. Please register your face first.' };
  }

  if (!userFace.samples || userFace.samples.length === 0) {
    return { match: false, reason: 'No face samples in database' };
  }

  let bestDistance = Infinity;
  let matched = false;

  for (const sample of userFace.samples) {
    const storedDescriptor = sample.descriptor;
    if (!storedDescriptor || storedDescriptor.length !== 128) continue;

    const distance = euclideanDistance(descriptor, storedDescriptor);
    if (distance < bestDistance) {
      bestDistance = distance;
    }
  }

  const THRESHOLD = 0.5;
  matched = bestDistance <= THRESHOLD;

  return {
    match: matched,
    distance: bestDistance,
    confidence: Math.max(0, (1 - bestDistance) * 100),
    reason: matched ? 'Verified' : `Face verification failed. Confidence: ${Math.max(0, (1 - bestDistance) * 100).toFixed(1)}%`,
  };
};

// POST /api/attendance/checkin
exports.checkIn = asyncHandler(async (req, res) => {
  const { descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ message: 'Invalid face descriptor' });
  }

  // ✅ IST Time check
  const timeCheck = checkTimeRestriction('checkin');
  if (!timeCheck.allowed) {
    return res.status(400).json({ message: timeCheck.message });
  }

  const user = await User.findById(req.user.id);
  if (!user || user.faceStatus !== 'approved') {
    return res.status(403).json({ message: 'Face not approved yet' });
  }

  const verification = await findMatchingFace(descriptor, req.user.id);
  if (!verification.match) {
    return res.status(401).json({ message: verification.reason, confidence: verification.confidence });
  }

  const today = startOfISTDay();
  const existing = await Attendance.findOne({ user: req.user.id, date: today });
  if (existing?.checkIn) {
    return res.status(400).json({ message: 'Already checked in today' });
  }

  const checkInTime = getISTTime();
  const status = computeStatus(checkInTime);

  const attendance = await Attendance.create({
    user: req.user.id,
    date: today,
    checkIn: checkInTime,
    status,
    checkInLocation: { ip: req.ip, userAgent: req.get('user-agent') },
  });

  res.json({
    success: true,
    attendance,
    matchConfidence: verification.confidence.toFixed(1) + '%',
    istTime: timeCheck.istTime,
    message: `Checked in at ${checkInTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} (${status})`,
  });
});

// POST /api/attendance/checkout
exports.checkOut = asyncHandler(async (req, res) => {
  const { descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ message: 'Invalid face descriptor' });
  }

  // ✅ IST Time check
  const timeCheck = checkTimeRestriction('checkout');
  if (!timeCheck.allowed) {
    return res.status(400).json({ message: timeCheck.message });
  }

  const user = await User.findById(req.user.id);
  if (!user || user.faceStatus !== 'approved') {
    return res.status(403).json({ message: 'Face not approved yet' });
  }

  const verification = await findMatchingFace(descriptor, req.user.id);
  if (!verification.match) {
    return res.status(401).json({ message: verification.reason });
  }

  const today = startOfISTDay();
  const attendance = await Attendance.findOne({ user: req.user.id, date: today });

  if (!attendance || !attendance.checkIn) {
    return res.status(400).json({ message: 'No check-in found for today' });
  }
  if (attendance.checkOut) {
    return res.status(400).json({ message: 'Already checked out today' });
  }

  const checkOutTime = getISTTime();
  attendance.checkOut = checkOutTime;
  attendance.workingSeconds = Math.floor((checkOutTime - attendance.checkIn) / 1000);
  attendance.workingHours = Math.floor(attendance.workingSeconds / 60);
  attendance.checkOutLocation = { ip: req.ip, userAgent: req.get('user-agent') };
  await attendance.save();

  const h = Math.floor(attendance.workingSeconds / 3600);
  const m = Math.floor((attendance.workingSeconds % 3600) / 60);
  const s = attendance.workingSeconds % 60;

  res.json({
    success: true,
    attendance,
    matchConfidence: verification.confidence.toFixed(1) + '%',
    istTime: timeCheck.istTime,
    workingTime: `${h}h ${m}m ${s}s`,
    message: `Checked out at ${checkOutTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
  });
});

// GET /api/attendance/today
exports.todayAttendance = asyncHandler(async (req, res) => {
  const today = startOfISTDay();
  const attendance = await Attendance.findOne({ user: req.user.id, date: today });
  res.json({ success: true, attendance });
});

// GET /api/attendance/history
exports.history = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = { user: req.user.id };
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }
  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
    Attendance.countDocuments(filter),
  ]);
  res.json({ success: true, records, page, pages: Math.ceil(total / limit), total });
});

// GET /api/attendance/stats
exports.stats = asyncHandler(async (req, res) => {
  const now = getISTTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [present, late, absent, total] = await Promise.all([
    Attendance.countDocuments({ user: req.user.id, date: { $gte: monthStart }, status: 'present' }),
    Attendance.countDocuments({ user: req.user.id, date: { $gte: monthStart }, status: 'late' }),
    Attendance.countDocuments({ user: req.user.id, date: { $gte: monthStart }, status: 'absent' }),
    Attendance.countDocuments({ user: req.user.id, date: { $gte: monthStart } }),
  ]);
  res.json({ success: true, stats: { present, late, absent, total, percentage: total ? Math.round(((present + late) / total) * 100) : 0 } });
});