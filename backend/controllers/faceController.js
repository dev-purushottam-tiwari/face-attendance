const asyncHandler = require('express-async-handler');
const FaceEmbedding = require('../models/FaceEmbedding');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/email');
const { rejectionTemplate, approvalTemplate } = require('../utils/emailTemplates');
const {
  averageDescriptor,
  isDuplicateFace,
} = require('../utils/face');

// POST /api/face/register
// POST /api/face/register
// POST /api/face/register
// POST /api/face/register
exports.registerFace = asyncHandler(async (req, res) => {
  const { samples } = req.body;
  
  if (!Array.isArray(samples) || samples.length < 3) {
    return res.status(400).json({ message: 'At least 3 face samples required' });
  }

  for (const s of samples) {
    if (!Array.isArray(s.descriptor) || s.descriptor.length !== 128) {
      return res.status(400).json({ message: 'Invalid face descriptor' });
    }
  }

  const allApproved = await FaceEmbedding.find({ 
    status: 'approved',
    user: { $ne: req.user.id }
  });
  
  for (const s of samples) {
    if (isDuplicateFace(s.descriptor, allApproved, req.user.id)) {
      return res.status(409).json({
        message: 'This face is already registered to another account.',
      });
    }
  }

  const descriptors = samples.map((s) => s.descriptor);
  const aggregate = averageDescriptor(descriptors);

  let face = await FaceEmbedding.findOne({ user: req.user.id });
  
  if (face) {
    face.samples = samples;
    face.aggregateDescriptor = aggregate;
    face.status = 'pending';
    face.rejectionReason = undefined;
    face.approvedBy = undefined;
    face.approvedAt = undefined;
    await face.save();
  } else {
    face = await FaceEmbedding.create({
      user: req.user.id,
      samples,
      aggregateDescriptor: aggregate,
      status: 'pending',
    });
  }

  const user = await User.findById(req.user.id);
  user.faceStatus = 'pending';
  user.faceRejectionReason = undefined;
  await user.save();

  // ✅ Notify all admins about face registration
  const Notification = require('../models/Notification');
  const admins = await User.find({ role: 'admin' });
  
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title: 'New Face Registration',
      message: `${user.name} has submitted face registration for approval.`,
      type: 'info',
      link: '/admin/faces',
    });
  }
  
  console.log(`✅ Face registration notification sent to ${admins.length} admin(s)`);

  res.json({ 
    success: true, 
    message: 'Face submitted for admin approval',
    faceId: face._id,
  });
});

// GET /api/face/status
exports.getFaceStatus = asyncHandler(async (req, res) => {
  const face = await FaceEmbedding.findOne({ user: req.user.id });
  const user = await User.findById(req.user.id);
  
  res.json({
    success: true,
    status: user.faceStatus || 'none',
    samplesCount: face?.samples.length || 0,
    rejectionReason: face?.rejectionReason || user.faceRejectionReason,
  });
});