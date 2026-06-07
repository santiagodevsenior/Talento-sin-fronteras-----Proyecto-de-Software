const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/projectController');
const commentCtrl = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const validateProject = [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('category').isIn(['music','visual_arts','theater','dance','photography','design','writing','modeling','other']),
];

router.get('/', optionalAuth, ctrl.getFeed);
router.get('/user/:userId', ctrl.getUserProjects);
router.get('/:id', optionalAuth, ctrl.getProject);
router.post('/', protect, upload.single('media'), validateProject, ctrl.createProject);
router.put('/:id', protect, validateProject, ctrl.updateProject);
router.delete('/:id', protect, ctrl.deleteProject);

// Comments nested under projects
router.post('/:id/comments', protect, [
  body('content').trim().notEmpty().isLength({ max: 1000 }),
  body('rating').isInt({ min: 1, max: 5 }),
], commentCtrl.addComment);
router.delete('/:projectId/comments/:id', protect, commentCtrl.deleteComment);
router.post('/:projectId/comments/:id/report', protect, commentCtrl.reportComment);

module.exports = router;
