const router = require('express').Router();
const { body } = require('express-validator');
const userCtrl = require('../controllers/userController');
const mentorCtrl = require('../controllers/mentorshipController');
const msgCtrl = require('../controllers/messageController');
const notifCtrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ── Users ──
router.get('/users/mentors', userCtrl.getMentors);
router.get('/users/:id/profile', userCtrl.getProfile);
router.put('/users/me', protect, upload.single('avatar'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 500 }),
], userCtrl.updateMe);

// ── Mentorships ──
router.post('/mentorships/request', protect, [
  body('mentorId').isUUID(),
  body('message').trim().isLength({ min: 10, max: 500 }),
], mentorCtrl.requestMentorship);
router.put('/mentorships/:id/respond', protect, mentorCtrl.respondMentorship);
router.get('/mentorships/dashboard', protect, mentorCtrl.getMentorDashboard);
router.get('/mentorships/my', protect, mentorCtrl.getMyMentorships);

// ── Messages / Chat ──
router.get('/messages/conversations', protect, msgCtrl.getConversations);
router.get('/messages/:userId', protect, msgCtrl.getConversation);
router.post('/messages', protect, msgCtrl.sendMessage);

// ── Notifications ──
router.get('/notifications', protect, notifCtrl.getNotifications);
router.get('/notifications/unread-count', protect, notifCtrl.unreadCount);
router.put('/notifications/read-all', protect, notifCtrl.markAllRead);
router.put('/notifications/:id/read', protect, notifCtrl.markRead);

module.exports = router;
