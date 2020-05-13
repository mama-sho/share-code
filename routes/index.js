'use strict'
const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const Favorite = require('../models/favorite')
const Comment = require('../models/comment')
const User = require('../models/user')

const Sequelize = require('sequelize')
const config = require('../webpack.config')

// Sequlize インスタンス
const sequelize = new Sequelize({
  dialect: 'postgres',
})

// home page//
//投稿一覧ページを表示
//* userテーブルとpostテーブルの結合 include

router.get('/', (req, res, next) => {
  // get メソッドで取得するなら、req.query
  Comment.findAll().then((comments) => {
    Favorite.findAll().then((favorites) => {
      Post.findAll({
        include: [
          {
            model: User,
          },
        ],
      }).then((posts) => {
        if (req.user) {
          User.findOne({
            where: { id: req.user.id },
          }).then((user) => {
            res.render('index', {
              posts: posts,
              comments: comments,
              favorites: favorites,
              user: user,
            })
          })
        }
        res.render('index', {
          posts: posts,
          comments: comments,
          favorites: favorites,
          user: 'null',
        })
      })
    })
  })
})

router.get('/layout', (req, res, next) => {
  res.render('layout')
})

module.exports = router
