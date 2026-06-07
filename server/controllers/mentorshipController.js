const { validationResult } = require('express-validator');
const { Mentorship, User, Notification } = require('../models');

/**
 * @description Student sends a mentorship request
 * @route POST /api/mentorships/request
 */
exports.requestMentorship = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { mentorId, message, discipline } = req.body;
  const mentor = await User.findByPk(mentorId);
  if (!mentor || !mentor.isAvailableAsMentor) {
    return res.status(400).json({ success: false, message: 'Mentor not found or unavailable' });
  }
  if (mentorId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot request mentorship from yourself' });
  }
  const existing = await Mentorship.findOne({
    where: { studentId: req.user.id, mentorId, status: 'pending' },
  });
  if (existing) return res.status(409).json({ success: false, message: 'Request already pending' });

  const mentorship = await Mentorship.create({ studentId: req.user.id, mentorId, message, discipline });

  await Notification.create({
    userId: mentorId,
    actorId: req.user.id,
    type: 'mentorship_request',
    title: `${req.user.name} solicita mentoría`,
    body: message.substring(0, 100),
    link: `/mentor/dashboard`,
  });

  res.status(201).json({ success: true, data: mentorship });
};

/**
 * @description Mentor accepts or rejects a mentorship request
 * @route PUT /api/mentorships/:id/respond
 */
exports.respondMentorship = async (req, res) => {
  const { status, mentorResponse } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
  }
  const mentorship = await Mentorship.findByPk(req.params.id);
  if (!mentorship) return res.status(404).json({ success: false, message: 'Not found' });
  if (mentorship.mentorId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (mentorship.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Already responded' });
  }

  await mentorship.update({ status, mentorResponse });

  await Notification.create({
    userId: mentorship.studentId,
    actorId: req.user.id,
    type: status === 'accepted' ? 'mentorship_accepted' : 'mentorship_rejected',
    title: status === 'accepted' ? `${req.user.name} aceptó tu solicitud` : `${req.user.name} rechazó tu solicitud`,
    body: mentorResponse || '',
    link: `/mentorships/${mentorship.id}`,
  });

  res.json({ success: true, data: mentorship });
};

/**
 * @description Get mentor dashboard — all mentorships where user is mentor
 * @route GET /api/mentorships/dashboard
 */
exports.getMentorDashboard = async (req, res) => {
  const mentorships = await Mentorship.findAll({
    where: { mentorId: req.user.id },
    include: [{ model: User, as: 'student', attributes: ['id','name','avatar','role','bio'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: mentorships });
};

/**
 * @description Get all mentorships where current user is student
 * @route GET /api/mentorships/my
 */
exports.getMyMentorships = async (req, res) => {
  const mentorships = await Mentorship.findAll({
    where: { studentId: req.user.id },
    include: [{ model: User, as: 'mentor', attributes: ['id','name','avatar','role','bio','skills'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: mentorships });
};
