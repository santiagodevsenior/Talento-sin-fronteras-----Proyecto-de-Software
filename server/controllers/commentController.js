const { validationResult } = require('express-validator');
const { Comment, Project, User, Notification } = require('../models');
const { sequelize } = require('../models');

/**
 * @description Add a comment + rating to a project; recalculates avgRating
 * @route POST /api/projects/:id/comments
 */
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const { content, rating } = req.body;
  const comment = await Comment.create({ content, rating, projectId: project.id, userId: req.user.id });

  // Recalculate avg rating
  const stats = await Comment.findOne({
    where: { projectId: project.id },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    raw: true,
  });
  await project.update({ avgRating: parseFloat(stats.avg || 0).toFixed(2), ratingCount: parseInt(stats.count) });

  // Notify project author (if not self)
  if (project.userId !== req.user.id) {
    await Notification.create({
      userId: project.userId,
      actorId: req.user.id,
      type: 'comment',
      title: `${req.user.name} comentó tu proyecto`,
      body: content.substring(0, 80),
      link: `/projects/${project.id}`,
    });
  }

  const full = await Comment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id','name','avatar'] }],
  });
  res.status(201).json({ success: true, data: full });
};

/**
 * @description Delete a comment (owner or admin)
 * @route DELETE /api/projects/:projectId/comments/:id
 */
exports.deleteComment = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Not found' });
  if (comment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  await comment.destroy();
  res.json({ success: true, message: 'Comment deleted' });
};

/**
 * @description Report a comment as inappropriate
 * @route POST /api/projects/:projectId/comments/:id/report
 */
exports.reportComment = async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Not found' });
  await comment.update({ isReported: true });
  res.json({ success: true, message: 'Comment reported' });
};
