'use strict'
const express = require('express')
const router = express.Router()

//　モデルの読み込み
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const Favorite = require('../models/favorite')

// 認証機能の読み込み 引数に加えることで有効
const authenticationEnsurer = require('./authentication-ensurer')

//投稿一覧ページを表示
//* userテーブルとpostテーブルの結合 include
// リレーションの設定をしていないとできない
// その後favoriteテーブルを与えている
router.get('/', (req, res, next) => {
  Post.findAll({
    include: [
      {
        model: User,
      },
    ],
  }).then(post => {
    Comment.findAll().then(comments => {
      Favorite.findAll().then(favorites => {
        if (req.user) {
          User.findOne({
            where: { id: req.user.id },
          }).then(user => {
            res.render('post', {
              post: post,
              comments: comments,
              favorites: favorites,
              user: user,
            })
          })
        }
        res.render('post', {
          post: post,
          comments: comments,
          favorites: favorites,
        })
      })
    })
  })
})

//　card作成ページ 認証機能 、User findOneで一つだけ取得、whereで条件絞り込み
router.get('/new', authenticationEnsurer, (req, res, next) => {
  //今まで自分が投降したコード進行を表示する
  User.findOne({
    where: { id: req.user.id },
  }).then(user => {
    res.render('post/new', { user: user })
  })
})
//ユーザー情報を取得できなかった時の処理。signin.ejsに行く

// 詳細ページ urlのパラメーターを受け取る　req.paramsで受け取れる
// Post.User Comment User
router.get('/:id', (req, res, next) => {
  Post.findOne({
    include: [
      {
        model: User,
      },
    ],
    where: { id: req.params.id },
  }).then(post => {
    Comment.findAll({
      include: [
        {
          model: User,
        },
      ],
      where: { postId: req.params.id },
    }).then(comments => {
      User.findOne({ where: { id: req.user.id } }).then(user => {
        res.render('post/detail', {
          post: post,
          comments: comments,
          user: user,
        })
      })
    })
  })
})
// 新規作成ページ
router.post('/new', authenticationEnsurer, (req, res, next) => {
  Post.create({
    songName: req.body.songName,
    isMajor: req.body.isMajor,
    isOriginal: req.body.isOriginal,
    progKey: req.body.progKey,
    codeProg: req.body.codeProg,
    memo: req.body.memo,
    userId: req.user.id,
    //音源を登録するところを実装したい
  }).then(() => {
    res.redirect('/mypage')
  })
})
// コメントの投稿処理
router.post('/:id', authenticationEnsurer, (req, res, next) => {
  Comment.create({
    postId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
  }).then(() => {
    res.redirect(`/posts/${req.params.id}`)
  })
})

module.exports = router
