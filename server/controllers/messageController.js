const { Message, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * @description Get conversation history between two users
 * @route GET /api/messages/:userId
 */
exports.getConversation = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id },
      ],
    },
    order: [['createdAt', 'ASC']],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    include: [
      { model: User, as: 'sender', attributes: ['id','name','avatar'] },
    ],
  });

  // Mark received messages as read
  await Message.update(
    { isRead: true },
    { where: { senderId: userId, receiverId: req.user.id, isRead: false } }
  );

  res.json({ success: true, data: messages });
};

/**
 * @description Get list of all conversations (unique users chatted with)
 * @route GET /api/messages/conversations
 */
exports.getConversations = async (req, res) => {
  const myId = req.user.id;
  // Get latest message per conversation partner
  const results = await sequelize.query(
    `SELECT DISTINCT ON (partner_id)
      partner_id,
      content,
      "createdAt",
      "isRead",
      "senderId"
     FROM (
       SELECT
         CASE WHEN "senderId" = :myId THEN "receiverId" ELSE "senderId" END as partner_id,
         content, "createdAt", "isRead", "senderId"
       FROM messages
       WHERE "senderId" = :myId OR "receiverId" = :myId
     ) sub
     ORDER BY partner_id, "createdAt" DESC`,
    { replacements: { myId }, type: sequelize.QueryTypes.SELECT }
  );

  const partnerIds = results.map((r) => r.partner_id);
  const partners = await User.findAll({
    where: { id: partnerIds },
    attributes: ['id','name','avatar','role'],
  });

  const conversations = results.map((r) => ({
    ...r,
    partner: partners.find((p) => p.id === r.partner_id),
  }));

  res.json({ success: true, data: conversations });
};

/**
 * @description Send a message (also via REST; Socket.IO is primary path)
 * @route POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  const { receiverId, content, mentorshipId } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  const msg = await Message.create({ senderId: req.user.id, receiverId, content, mentorshipId });
  const full = await Message.findByPk(msg.id, {
    include: [{ model: User, as: 'sender', attributes: ['id','name','avatar'] }],
  });
  res.status(201).json({ success: true, data: full });
};
