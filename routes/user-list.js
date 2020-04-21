'use strict'
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Favorites = require('../models/favorite')
const Post = require('../models/post')

// ユーザー一覧ページ
router.get('/', (req, res, next) => {
  User.findAll().then(users => {
    Post.findAll({
      include: [
        {
          model: User,
        },
      ],
    }).then(post => {
      Favorites.findAll().then(favorites => {
        res.render('user-list', {
          users: users,
          post: post,
          favorites: favorites,
        })
      })
    })
  })
})

module.exports = router
