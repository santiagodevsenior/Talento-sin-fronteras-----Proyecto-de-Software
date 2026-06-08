const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL, {
      dialect: 'postgres',
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'talento_sin_frontera',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    );

module.exports = sequelize;