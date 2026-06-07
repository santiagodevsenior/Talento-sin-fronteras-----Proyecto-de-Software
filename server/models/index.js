const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Comment = require('./Comment');
const Mentorship = require('./Mentorship');
const Message = require('./Message');
const Notification = require('./Notification');

// User ↔ Projects
User.hasMany(Project, { foreignKey: 'userId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Project ↔ Comments
Project.hasMany(Comment, { foreignKey: 'projectId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User ↔ Comments
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Mentorships
User.hasMany(Mentorship, { foreignKey: 'studentId', as: 'sentMentorships' });
User.hasMany(Mentorship, { foreignKey: 'mentorId', as: 'receivedMentorships' });
Mentorship.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Mentorship.belongsTo(User, { foreignKey: 'mentorId', as: 'mentor' });

// Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Mentorship.hasMany(Message, { foreignKey: 'mentorshipId', as: 'messages' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

module.exports = { sequelize, User, Project, Comment, Mentorship, Message, Notification };
