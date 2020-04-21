//  厳格モード、sequelizeの読み込み
'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

// モデルの作成
const Favorite = loader.database.define(
  'favorites',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    //テーブル名の固定
    freezeTableName: true,
  }
);

module.exports = Favorite;
