const { Notification, User } = require('../models');

/**
 * @description Get all notifications for current user (most recent first)
 * @route GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'actor', attributes: ['id','name','avatar'] }],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  res.json({ success: true, data: notifications });
};

/**
 * @description Mark specific notification as read
 * @route PUT /api/notifications/:id/read
 */
exports.markRead = async (req, res) => {
  const notif = await Notification.findByPk(req.params.id);
  if (!notif || notif.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  await notif.update({ isRead: true });
  res.json({ success: true });
};

/**
 * @description Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
exports.markAllRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  res.json({ success: true });
};

/**
 * @description Count unread notifications
 * @route GET /api/notifications/unread-count
 */
exports.unreadCount = async (req, res) => {
  const count = await Notification.count({ where: { userId: req.user.id, isRead: false } });
  res.json({ success: true, count });
};
