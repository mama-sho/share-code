'use strict';
const express = require('express');
const router = express.Router();

// 外部モジュールのpassportの読み込み
const passport = require('passport');

router.get('/', (req, res, next) => {
  res.render('login');
});

//  passport.authenticate('local' 成功時のリダイレクト先、失敗時のリダイレクト先)
//  failureFlashをtrueにすると、失敗した時に、errorメッセとして、検認用コールバックで表示
//    または'文字列'を表示できる　フラッシュメッセージ successFlashもある
router.post(
  '/',
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/login',
    failureFlash: false,
  })
);

module.exports = router;
