const Notification = require('../models/Notification');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    const userId = req.user.id;

    let query = { recipientRole: userRole };

    // If it's a regular user, only show their notifications
    if (userRole === 'user') {
      query.recipient = userId;
    }
    // If it's superadmin, show all superadmin notifications
    // (In a more complex app, we might filter by specific admin ID if assigned)

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    const userId = req.user.id;

    let query = { recipientRole: userRole, isRead: false };
    if (userRole === 'user') {
      query.recipient = userId;
    }

    await Notification.updateMany(query, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to create notification (not an exported route)
exports.createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
