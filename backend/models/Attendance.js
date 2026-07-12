const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // normalized to start-of-day
    
    // Precise timestamps with milliseconds
    checkIn: { type: Date },
    checkOut: { type: Date },
    
    // Working time tracking
    workingHours: { type: Number, default: 0 }, // in minutes
    workingSeconds: { type: Number, default: 0 }, // exact seconds
    
    checkInLocation: {
      ip: String,
      userAgent: String,
    },
    checkOutLocation: {
      ip: String,
      userAgent: String,
    },
    
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half-day', 'on-leave'],
      default: 'present',
    },
    
    isAutoAbsent: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

// Virtual for formatted working time
attendanceSchema.virtual('workingTimeFormatted').get(function() {
  if (!this.workingSeconds) return '0h 0m 0s';
  const hours = Math.floor(this.workingSeconds / 3600);
  const minutes = Math.floor((this.workingSeconds % 3600) / 60);
  const seconds = this.workingSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);