const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mentorship = sequelize.define('Mentorship', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  mentorId: { type: DataTypes.UUID, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending',
  },
  mentorResponse: { type: DataTypes.TEXT },
  discipline: { type: DataTypes.STRING(100) },
}, {
  tableName: 'mentorships',
  timestamps: true,
});

module.exports = Mentorship;
