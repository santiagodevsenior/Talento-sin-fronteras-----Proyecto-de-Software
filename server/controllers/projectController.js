const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Project, User, Comment, Notification } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

const CATEGORIES = ['music','visual_arts','theater','dance','photography','design','writing','modeling','other'];

/**
 * @description Get paginated feed of projects with optional filters
 * @route GET /api/projects
 */
exports.getFeed = async (req, res) => {
  const { page = 1, limit = 20, category, sort = 'recent', search } = req.query;
  const offset = (page - 1) * limit;

  const where = { isPublished: true };
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (search) where.title = { [Op.iLike]: `%${search}%` };

  const order = sort === 'top' ? [['avgRating', 'DESC']] : [['createdAt', 'DESC']];

  const { count, rows } = await Project.findAndCountAll({
    where, order, limit: parseInt(limit), offset,
    include: [{ model: User, as: 'author', attributes: ['id','name','avatar','role'] }],
  });

  res.json({ success: true, data: rows, meta: { total: count, page: +page, pages: Math.ceil(count / limit) } });
};

/**
 * @description Get single project by id
 * @route GET /api/projects/:id
 */
exports.getProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      { model: User, as: 'author', attributes: ['id','name','avatar','role','bio'] },
      { model: Comment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id','name','avatar'] }], order: [['createdAt','DESC']] },
    ],
  });
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  await project.increment('viewCount');
  res.json({ success: true, data: project });
};

/**
 * @description Create and publish a new project
 * @route POST /api/projects
 */
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { title, description, category, tags } = req.body;
  let mediaUrl, mediaPublicId, mediaType = 'none', thumbnail;

  if (req.file) {
    const mime = req.file.mimetype;
    const resourceType = mime.startsWith('video') ? 'video' : mime === 'application/pdf' ? 'raw' : 'image';
    const result = await uploadToCloudinary(req.file.buffer, 'tsf/projects', resourceType);
    mediaUrl = result.secure_url;
    mediaPublicId = result.public_id;
    mediaType = resourceType === 'raw' ? 'pdf' : resourceType;
    if (resourceType === 'video') thumbnail = result.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill/');
    if (resourceType === 'image') thumbnail = result.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill/');
  }

  const project = await Project.create({
    title, description, category,
    tags: tags ? JSON.parse(tags) : [],
    mediaUrl, mediaPublicId, mediaType, thumbnail,
    userId: req.user.id,
  });

  const full = await Project.findByPk(project.id, {
    include: [{ model: User, as: 'author', attributes: ['id','name','avatar','role'] }],
  });
  res.status(201).json({ success: true, data: full });
};

/**
 * @description Update project (owner only)
 * @route PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  if (project.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const { title, description, category, tags } = req.body;
  await project.update({ title, description, category, tags: tags ? JSON.parse(tags) : project.tags });
  res.json({ success: true, data: project });
};

/**
 * @description Delete project and its Cloudinary asset (owner or admin)
 * @route DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Not found' });
  if (project.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  if (project.mediaPublicId) {
    await deleteFromCloudinary(project.mediaPublicId, project.mediaType === 'pdf' ? 'raw' : project.mediaType).catch(() => {});
  }
  await project.destroy();
  res.json({ success: true, message: 'Project deleted' });
};

/**
 * @description Get all projects by a specific user
 * @route GET /api/projects/user/:userId
 */
exports.getUserProjects = async (req, res) => {
  const projects = await Project.findAll({
    where: { userId: req.params.userId, isPublished: true },
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'author', attributes: ['id','name','avatar','role'] }],
  });
  res.json({ success: true, data: projects });
};
