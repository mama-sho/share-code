'use strict'
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Favorites = require('../models/favorite')
const Post = require('../models/post')
const Comment = require('../models/comment')

// ユーザー一覧ページ
router.get('/', (req, res, next) => {
  User.findAll().then((users) => {
    Post.findAll({
      include: [
        {
          model: User,
        },
      ],
    }).then((posts) => {
      Favorites.findAll().then((favorites) => {
        // .map は配列を一つずつ処理を加えて、新しい配列を作成する
        users = users.map((user) => {
          // userに新たにfavoriteのプロパティを追加
          user.favorite = favorites.filter((v) => {
            // お気に入り数を計算
            const post = posts.find((p) => p.id === v.postId)
            //　三項演算子 post があればuserIdを、なければ nullを渡す
            const userId = post ? post.userId : null
            return userId === user.id
          }).length
          return user
        })
        // 並び替え機能
        if (req.query.sort) {
          users.sort(lineUp)
          function lineUp(a, b) {
            if (req.query.sort === 'favorite') {
              var sortA = a.favorite
              var sortB = b.favorite
            } else if (req.query.sort === 'post') {
              var sortA = 0
              var sortB = 0
              posts.forEach((post) => {
                if (a.id === post.userId) {
                  sortA++
                } else if (b.id === post.userId) {
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

        res.render('user-list', {
          users: users,
          posts: posts,
        })
      })
    })
  })
})

//  user 詳細ページ
router.get('/detail/:id', (req, res, next) => {
  User.findOne({
    where: { id: req.params.id },
  }).then((user) => {
    Post.findAll({
      include: [
        {
          model: User,
        },
      ],
      where: { userId: req.params.id },
    }).then((posts) => {
      Comment.findAll().then((comments) => {
        Favorites.findAll().then((favorites) => {
          if (!req.user) {
            req.user = { id: null }
          }
          //お気に入りの状態を持たせる
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
          // ログイン状態なら、自分のidを渡す　でないなら、null
          res.render('user-list/detail', {
            user: user,
            posts: posts,
            comments: comments,
            favorites: favorites,
            myuser: req.user,
          })
        })
      })
    })
  })
})

module.exports = router
