const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM('music', 'visual_arts', 'theater', 'dance', 'photography', 'design', 'writing', 'modeling', 'other'),
    allowNull: false,
  },
  mediaUrl: { type: DataTypes.STRING },
  mediaPublicId: { type: DataTypes.STRING },
  mediaType: { type: DataTypes.ENUM('image', 'video', 'pdf', 'none'), defaultValue: 'none' },
  thumbnail: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  avgRating: { type: DataTypes.FLOAT, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  userId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'projects',
  timestamps: true,
});

module.exports = Project;
