const { validationResult } = require('express-validator');
const { User, Project } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

/**
 * @description Get public profile of any user
 * @route GET /api/users/:id/profile
 */
exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Project, as: 'projects', where: { isPublished: true }, required: false, order: [['createdAt','DESC']], limit: 6 }],
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

/**
 * @description Update authenticated user's profile
 * @route PUT /api/users/me
 */
exports.updateMe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, bio, skills, interests, socialLinks, isAvailableAsMentor } = req.body;
  let avatarUpdate = {};

  if (req.file) {
    if (req.user.avatarPublicId) await deleteFromCloudinary(req.user.avatarPublicId).catch(() => {});
    const result = await uploadToCloudinary(req.file.buffer, 'tsf/avatars', 'image');
    avatarUpdate = { avatar: result.secure_url, avatarPublicId: result.public_id };
  }

  await req.user.update({
    name, bio,
    skills: skills ? JSON.parse(skills) : req.user.skills,
    interests: interests ? JSON.parse(interests) : req.user.interests,
    socialLinks: socialLinks ? JSON.parse(socialLinks) : req.user.socialLinks,
    isAvailableAsMentor: isAvailableAsMentor !== undefined ? isAvailableAsMentor === 'true' : req.user.isAvailableAsMentor,
    ...avatarUpdate,
  });

  res.json({ success: true, data: req.user });
};

/**
 * @description Search and list available mentors
 * @route GET /api/users/mentors
 */
exports.getMentors = async (req, res) => {
  const { discipline, search, page = 1, limit = 12 } = req.query;
  const { Op } = require('sequelize');
  const where = { isAvailableAsMentor: true, isActive: true };
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (discipline) where.skills = { [Op.contains]: [discipline] };

  const { count, rows } = await User.findAndCountAll({
    where, limit: parseInt(limit), offset: (page - 1) * limit,
    attributes: ['id','name','avatar','role','bio','skills','interests'],
    order: [['name','ASC']],
  });
  res.json({ success: true, data: rows, meta: { total: count, page: +page } });
};
