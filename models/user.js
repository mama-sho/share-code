// 厳格モードの使用
//sequelize-loaderの読み込み
'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

// データベースに保存するテーブルの設計図（カラム）.'users'テーブル名
//これらが実体化したものインスタンスという　例.　５人の中の１人のemail.id.name.password.
const User = loader.database.define(
  'users',
  {
    //INTEGER は数値、primaryKeyは重複しない、allowNull:空にしない、autoIncrement: 自動生成,
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    //STRING : 文字列
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    favoriteInstrument: {
      type: Sequelize.STRING,
    }, //画像ファイル名を保存して、aws S3と紐付ける
    iconFileName: {
      type: Sequelize.STRING,
    }, // 紹介文を追加　最大文字数は？
    introduction: {
      type: Sequelize.STRING,
    },
  },
  {
    //emailの同じものをはじく設定
    indexes: [{ unique: true, fields: ['email'] }],
    //sequelizeはテーブル名を自動的に複数形にするので、trueで固定している
    freezeTableName: true,
  }
);
// モデルを他のファイルで使用できるようにする
module.exports = User;
