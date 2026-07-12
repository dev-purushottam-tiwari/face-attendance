const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

/**
 * Mark absent for yesterday at 00:05 if no record exists.
 */
exports.scheduleAbsentCron = () => {
  // Runs daily at 00:05
  cron.schedule('5 0 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const day = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );

      const approvedUsers = await User.find({
        role: 'employee',
        isApproved: true,
        faceStatus: 'approved',
        isActive: true,
      }).select('_id');

      const existing = await Attendance.find({ date: day }).select('user');
      const existingSet = new Set(existing.map((a) => a.user.toString()));

      const bulk = approvedUsers
        .filter((u) => !existingSet.has(u._id.toString()))
        .map((u) => ({
          updateOne: {
            filter: { user: u._id, date: day },
            update: {
              $setOnInsert: {
                user: u._id,
                date: day,
                status: 'absent',
                isAutoAbsent: true,
              },
            },
            upsert: true,
          },
        }));

      if (bulk.length) {
        await Attendance.bulkWrite(bulk);
        console.log(`🕒 Auto-marked ${bulk.length} absent for ${day.toDateString()}`);
      }
    } catch (err) {
      console.error('Cron error:', err);
    }
  });
};