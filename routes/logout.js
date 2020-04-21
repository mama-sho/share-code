'use strict';
const express = require('express');
const router = express.Router();

// ログアウト処理
router.get('/', (req, res, next) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
