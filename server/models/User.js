const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @description User model — represents registered users of all roles
 */
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student', 'professional', 'creator', 'admin'), defaultValue: 'student' },
  bio: { type: DataTypes.TEXT },
  avatar: { type: DataTypes.STRING },
  avatarPublicId: { type: DataTypes.STRING },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  interests: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  socialLinks: { type: DataTypes.JSONB, defaultValue: {} },
  isAvailableAsMentor: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE },
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: { attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] } },
  scopes: { withPassword: { attributes: {} } },
});

module.exports = User;
