const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { sendMail } = require('../config/mailer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

/**
 * @description Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, role, interests, skills } = req.body;
  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, role, interests, skills });
  const token = signToken(user.id);

  await sendMail(
    email,
    'Bienvenido a Talento Sin Frontera 🎨',
    `<h2>Hola ${name}!</h2><p>Tu cuenta fue creada exitosamente. Empieza a compartir tu talento hoy.</p>`
  ).catch(() => {});

  res.status(201).json({ success: true, token, user: { id: user.id, name, email, role } });
};

/**
 * @description Login with email and password, returns JWT
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

  const token = signToken(user.id);
 const safeUser = user.toJSON();
delete safeUser.password;
res.json({ success: true, token, user: safeUser });
};

/**
 * @description Get currently authenticated user
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/**
 * @description Send password reset email
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  // Always respond 200 to avoid email enumeration
  if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendMail(
    email,
    'Restablecer contraseña — Talento Sin Frontera',
    `<p>Haz clic en el siguiente enlace para restablecer tu contraseña (válido 1 hora):</p><a href="${resetUrl}">${resetUrl}</a>`
  );
  res.json({ success: true, message: 'If that email exists, a reset link was sent' });
};

/**
 * @description Reset password using token from email
 * @route POST /api/auth/reset-password/:token
 */
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.scope('withPassword').findOne({
    where: { resetPasswordToken: hashedToken },
  });
  if (!user || new Date() > user.resetPasswordExpires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};
