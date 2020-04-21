//  厳格モード、sequelizeの読み込み
'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

// モデルの作成
const Notice = loader.database.define(
  'notices',
  {
    id: {
      //主キーのID
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    senderId: {
      // 送信者のID
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    receiverId: {
      //受信者のID
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    targetId: {
      //飛ばしたい先のId
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
      //　コメントの通知か？postいい値の通知か？
      type: Sequelize.STRING,
      allowNull: false,
    },
    isReed: {
      //  読まれたか？
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, //初期値の設定
    },
  },
  {
    //テーブル名の固定
    freezeTableName: true,
  }
);

module.exports = Notice;
