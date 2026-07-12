const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// GET /api/notifications
exports.myNotifications = asyncHandler(async (req, res) => {
  console.log(`\n📬 Fetching notifications for user: ${req.user.id}`);
  
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);
  
  const unread = await Notification.countDocuments({ 
    user: req.user.id, 
    read: false 
  });
  
  console.log(`✅ Found ${notifications.length} notifications, ${unread} unread`);
  
  res.json({ 
    success: true, 
    notifications,
    unread,
  });
});

// POST /api/notifications/read
exports.markRead = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  console.log(`\n📬 Marking notifications as read for user: ${req.user.id}`);
  console.log(`   IDs: ${ids ? ids.length : 'all'}`);
  
  if (ids && Array.isArray(ids)) {
    await Notification.updateMany(
      { user: req.user.id, _id: { $in: ids } },
      { $set: { read: true } }
    );
    console.log(`✅ Marked ${ids.length} notifications as read`);
  } else {
    // Mark all as read
    const result = await Notification.updateMany(
      { user: req.user.id },
      { $set: { read: true } }
    );
    console.log(`✅ Marked all notifications as read (${result.modifiedCount} updated)`);
  }
  
  res.json({ success: true });
});

// DELETE /api/notifications/:id (optional - delete single notification)
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  res.json({ success: true });
});