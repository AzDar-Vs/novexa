const { Sequelize } = require('sequelize');

const db = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  logging: false
});

module.exports = db;
