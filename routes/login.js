'use strict'
const express = require('express')
const router = express.Router()

// 外部モジュールのpassportの読み込み
const passport = require('passport')
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

router.get('/', csrfProtection, (req, res, next) => {
  const from = req.query.from
  if (from) {
    res.cookie('loginFrom', from, { expires: new Date(Date.now() + 600000) })
  }
  res.render('login', { csrfToken: req.csrfToken() })
})

//  passport.authenticate('local' 成功時のリダイレクト先、失敗時のリダイレクト先)
//  failureFlashをtrueにすると、失敗した時に、errorメッセとして、検認用コールバックで表示
//    または'文字列'を表示できる　フラッシュメッセージ successFlashもある
router.post(
  '/',
  csrfProtection,
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: false,
  }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom
    // オープンリダイレクタ脆弱性対策
    if (
      loginFrom &&
      !loginFrom.includes('http://') &&
      !loginFrom.includes('https://')
    ) {
      res.clearCookie('loginFrom')
      res.redirect(loginFrom)
    } else {
      res.redirect('/')
    }
  },
)

module.exports = router
