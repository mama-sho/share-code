//  厳格モード、sequelizeの読み込み
'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

//  モデルの作成
const Comment = loader.database.define(
  'comments',
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
    replyId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    //  カラム名を固定
    freezeTableName: true,
  }
);
//　他のファイルに公開
module.exports = Comment;
