const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { sendEmail } = require('../config/email');
const { otpTemplate, approvalTemplate, resetTemplate } = require('../utils/emailTemplates');

// POST /api/auth/register
// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, employeeId, email, password, department, designation } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { employeeId }] });
  if (exists) {
    return res.status(400).json({ message: 'Email or Employee ID already exists' });
  }

  const user = await User.create({
    name,
    employeeId,
    email,
    password,
    department,
    designation,
  });

  // ✅ Notify all admins about new registration
  const Notification = require('../models/Notification');
  const admins = await User.find({ role: 'admin' });
  
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title: 'New Employee Registration',
      message: `${name} (${employeeId}) has registered and is awaiting approval.`,
      type: 'info',
      link: '/admin/employees',
    });
  }
  
  console.log(`✅ Registration notification sent to ${admins.length} admin(s)`);

  res.status(201).json({
    success: true,
    message: 'Registration submitted. Awaiting admin approval.',
  });
});

// POST /api/auth/login
// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.isApproved) {
    return res.status(403).json({ message: 'Account pending admin approval' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Account deactivated' });
  }

  // ✅ VALIDATE EMAIL BEFORE SENDING OTP
  const { validateEmail } = require('../utils/emailValidator');
  const emailValidation = await validateEmail(email);
  
  console.log('\n Email Validation:', emailValidation);

  if (!emailValidation.canSend) {
    return res.status(400).json({
      message: `Cannot send OTP: ${emailValidation.reason}`,
      emailValid: false,
    });
  }

  // ADMIN: No OTP required - login directly
  if (user.role === 'admin') {
    console.log('\n🔐 Admin login (no OTP required)');
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    
    return res.json({
      success: true,
      token,
      directLogin: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        designation: user.designation,
        faceStatus: user.faceStatus,
      },
    });
  }

  // EMPLOYEE: OTP required only on first login
  if (user.firstLoginDone) {
    console.log('\n🔐 Employee returning login (no OTP needed)');
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    
    return res.json({
      success: true,
      token,
      directLogin: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        designation: user.designation,
        faceStatus: user.faceStatus,
      },
    });
  }

  // First time login - send OTP
  console.log('\n🔐 Employee first login - sending OTP');
  
  const otp = user.generateOtp('login');
  await user.save({ validateBeforeSave: false });

  // Log OTP to console
  console.log('\n' + '='.repeat(50));
  console.log(`📧 LOGIN OTP for ${user.email}: ${otp}`);
  console.log('='.repeat(50) + '\n');

  // Try email but don't crash
  try {
    await sendEmail({
      to: user.email,
      subject: 'Your Login OTP',
      html: otpTemplate(otp, 'login verification'),
    });
    console.log('✅ OTP email sent successfully');
  } catch (err) {
    console.warn('⚠️  Email failed:', err.message);
    return res.status(500).json({
      message: 'Failed to send OTP email. Please check your email address or contact support.',
    });
  }

  res.json({
    success: true,
    message: 'OTP sent to your email',
    email: user.email,
    directLogin: false,
    needsFaceRegistration: user.faceStatus !== 'approved',
  });
});

// POST /api/auth/verify-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.otpPurpose !== 'login') {
    return res.status(400).json({ message: 'No login OTP pending' });
  }

  if (!user.verifyOtp(otp)) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Mark first login as done
  user.firstLoginDone = true;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    directLogin: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      department: user.department,
      designation: user.designation,
      faceStatus: user.faceStatus,
    },
  });
});

// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = user.generateOtp('reset');
  await user.save({ validateBeforeSave: false });

  console.log('\n' + '='.repeat(50));
  console.log(`🔐 RESET OTP for ${user.email}: ${otp}`);
  console.log('='.repeat(50) + '\n');

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: resetTemplate(otp),
    });
  } catch (err) {
    console.warn('⚠️  Email failed:', err.message);
  }

  res.json({ success: true, message: 'Reset OTP generated. Check console.' });
});

// POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.otpPurpose !== 'reset') {
    return res.status(400).json({ message: 'No reset OTP pending' });
  }
  if (!user.verifyOtp(otp)) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  user.password = password;
  await user.save();
  res.json({ success: true, message: 'Password reset successfully' });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, department, designation } = req.body;
  const user = await User.findById(req.user.id);
  if (name) user.name = name;
  if (department) user.department = department;
  if (designation) user.designation = designation;
  await user.save();
  res.json({ success: true, user });
});