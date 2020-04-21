'use strict'
const express = require('express')
const router = express.Router()

//　モデルの読み込み
const Favorite = require('../models/favorite')
const Notice = require('../models/notice')

//  認証処理を読み込み
const authenticationEnsurer = require('./authentication-ensurer')

// <a>タグで送る 絞り込み今のpost.idとuser.id//
router.get('/:postId', authenticationEnsurer, (req, res, next) => {
  Favorite.findOne({
    where: {
      postId: req.params.postId,
      userId: req.user.id,
    },
  }).then(favorite => {
    // favoriteに絞り込みの結果が入っている
    // すでに、情報がある場合は、削除する
    if (favorite) {
      favorite.destroy().then(() => {
        res.redirect('/posts')
      })
    } else {
      Favorite.create({
        postId: req.params.postId,
        userId: req.user.id,
      }).then(() => {
        // 通知を追加する  確認してほしい
        Notice.create({
          senderId: req.user.id,
          receiverId: req.post.id,
          targetId: req.params.postId,
          type: req.params.postId,
        }).then(() => {
          res.redirect('/posts')
        })
      })
    }
  })
})

module.exports = router
