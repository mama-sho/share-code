//  厳格モード　sequelizeの読み込み
'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Post = loader.database.define(
  'posts',
  {
    //主キー
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    //投稿したユーザーid
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    //メジャーキーかどうか
    isMajor: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    //このコード進行のKey
    progKey: {
      type: Sequelize.STRING,
    },
    //コード進行
    //ユーザーが自由にかける
    codeProg: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    //オリジナル曲かどうか
    isOriginal: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    //曲名orタイトル
    songName: {
      type: Sequelize.STRING,
    },
    //オリジナル曲の音源を保存するところ
    source: {
      type: Sequelize.STRING,
    },
    //コード関して伝えたいところ
    memo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    //　テーブル名の固定
    freezeTableName: true,
  }
);

module.exports = Post;
