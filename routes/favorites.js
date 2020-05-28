'use strict'
const express = require('express')
const router = express.Router()

//　モデルの読み込み
const Favorite = require('../models/favorite')
const Notice = require('../models/notice')
const Post = require('../models/post')

//  認証処理を読み込み
const authenticationEnsurer = require('./authentication-ensurer')

// 絞り込み今のpost.idとuser.id//
router.post('/', authenticationEnsurer, (req, res, next) => {
  Favorite.findOne({
    where: {
      postId: req.body.postId,
      userId: req.body.userId,
    },
  }).then((favorite) => {
    // favoriteに絞り込みの結果が入っている
    // すでに、情報がある場合は、削除する
    if (favorite) {
      favorite.destroy().then(() => {
        res.json({ result: true })
      })
    } else {
      Favorite.create({
        postId: req.body.postId,
        userId: req.body.userId,
      }).then(() => {
        // 通知を追加する
        Post.findOne({
          where: { id: req.body.postId },
        }).then((post) => {
          Notice.create({
            senderId: req.body.userId,
            receiverId: post.userId,
            targetId: req.body.postId,
            isReed: false,
            type: 'favorite',
          }).then(() => {
            res.json({ result: true })
          })
        })
      })
    }
  })
})

module.exports = router
