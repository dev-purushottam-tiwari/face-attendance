const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['employee', 'admin'],
      default: 'employee',
    },
    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Face registration state
    faceStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    faceApprovedAt: Date,
    faceApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    faceRejectionReason: String,

    // OTP
    otp: String,
    otpExpires: Date,
    otpPurpose: { type: String, enum: ['login', 'reset'] },

    passwordResetToken: String,
    passwordResetExpires: Date,

    // ✅ NEW: Track first login for OTP logic
    firstLoginDone: { type: Boolean, default: false },
    
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateOtp = function (purpose) {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpPlain = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000;
  this.otpPurpose = purpose;
  return otp;
};

userSchema.methods.verifyOtp = function (plainOtp) {
  const hash = crypto.createHash('sha256').update(plainOtp).digest('hex');
  if (this.otp !== hash || this.otpExpires < Date.now()) return false;
  this.otp = undefined;
  this.otpExpires = undefined;
  this.otpPurpose = undefined;
  return true;
};

module.exports = mongoose.model('User', userSchema);