const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('comment', 'mentorship_request', 'mentorship_accepted', 'mentorship_rejected', 'message', 'rating'),
    allowNull: false,
  },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT },
  link: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  actorId: { type: DataTypes.UUID },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
