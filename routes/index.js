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
        // 並び替え機能
        if (req.query.sort) {
          posts.sort(lineUp)
          function lineUp(a, b) {
            if (req.query.sort === 'favorite_hi') {
              var sortA = 0
              var sortB = 0
              favorites.forEach((favorite) => {
                if (a.id === favorite.postId) {
                  sortA++
                } else if (b.id === favorite.postId) {
                  sortB++
                }
              })
            } else if (req.query.sort === 'comment_hi') {
              var sortA = 0
              var sortB = 0
              comments.forEach((comment) => {
                if (a.id === comment.postId) {
                  sortA++
                } else if (b.id === comment.postId) {
                  sortB++
                }
              })
            }
            let comparison = 0
            if (sortA > sortB) {
              comparison = 1
            } else if (sortA < sortB) {
              comparison = -1
            }
            return comparison * -1
          }
        }
        if (!req.user) {
          req.user = { id: null }
        }
        // お気に入りの状態を持たせる
        posts.forEach((post) => {
          post.isFavorite = favorites.some((favorite) => {
            return (
              favorite.userId === req.user.id && post.id === favorite.postId
            )
          })
          post.favoriteCount = favorites.filter(
            (v) => post.id === v.postId,
          ).length
          post.commentCount = comments.filter(
            (v) => post.id === v.postId,
          ).length
        })
        res.render('index', {
          posts: posts,
          comments: comments,
          favorites: favorites,
          user: req.user,
        })
      })
    })
  })
})

router.get('/layout', (req, res, next) => {
  res.render('layout')
})

module.exports = router
