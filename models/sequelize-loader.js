'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/share_code',
  {
    operatorsAliases: false,
  }
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize,
};
//SQLのログを出す設定にしてある
//データベースのURLにログが出る
