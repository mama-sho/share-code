'use strict'
const express = require('express')
const router = express.Router()

//　モデルの読み込み
const Favorite = require('../models/favorite')
const Notice = require('../models/notice')
const Post = require('../models/post')

//  認証処理を読み込み
const authenticationEnsurer = require('./authentication-ensurer')

// <a>タグで送る 絞り込み今のpost.idとuser.id//
router.get('/:id', authenticationEnsurer, (req, res, next) => {
  console.log('test')
  Favorite.findOne({
    where: {
      postId: req.params.id,
      userId: req.user.id,
    },
  }).then((favorite) => {
    // favoriteに絞り込みの結果が入っている
    // すでに、情報がある場合は、削除する
    if (favorite) {
      favorite.destroy().then(() => {
        res.redirect('/posts')
      })
    } else {
      Favorite.create({
        postId: req.params.id,
        userId: req.user.id,
      }).then(() => {
        // 通知を追加する
        Post.findOne({
          where: { id: req.params.id },
        }).then((post) => {
          Notice.create({
            senderId: req.user.id,
            receiverId: post.userId,
            targetId: req.params.id,
            isReed: false,
            type: 'favorite',
          }).then(() => {
            res.redirect('/posts')
          })
        })
      })
    }
  })
})

module.exports = router
