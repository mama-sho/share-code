'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');

// モデルの読み込み
const User = require('../models/user');

//詳細ページ
router.get('/', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: { id: req.user.id }
  }).then(instrument => {
    res.render('instrument', { instrument: instrument });
  });
});

//一覧ページ findAllは配列が返ってくる
router.get('/instrument-list', (req, res, next) => {
  User.findAll().then(instruments => {
    res.render('instrument/instrument-list', { instruments: instruments });
  });
});

//編集ページ
router.get('/edit', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: { id: req.user.id }
  }).then(instrument => {
    res.render('instrument/edit', { instrument: instrument });
  });
});

//編集ページデータベースに保存
router.post('/edit', authenticationEnsurer, (req, res, next) => {
  User.findOne({ where: { id: req.user.id } }).then(user => {
    user
      .update({
        favoriteInstrument: req.body.favoriteInstrument
      })
      .then(() => {
        res.redirect('/instrument');
      });
  });
});

module.exports = router;
