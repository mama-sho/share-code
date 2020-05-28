'use strict'
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Notice = require('../models/notice')
const Favorite = require('../models/favorite')
const Comment = require('../models/comment')
const authenticationEnsurer = require('./authentication-ensurer')
const AWS = require('aws-sdk')
const fs = require('fs')
const csrf = require('csurf')
const csrfProtection = csrf({ cooike: true })
require('date-utils')

//include
router.get('/', authenticationEnsurer, (req, res, next) => {
  Comment.findAll({
    where: { userId: req.user.id },
    attributes: ['postId'],
    group: ['postId'],
  }).then((comments) => {
    Favorite.findAll().then((favorites) => {
      Notice.findAll({
        where: {
          receiverId: req.user.id,
          isReed: 'false',
        },
      }).then((notices) => {
        Post.findAll({
          include: [
            {
              model: User,
            },
          ],
        }).then((posts) => {
          User.findOne({
            where: { id: req.user.id },
          }).then((user) => {
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
            res.render('mypage', {
              comments: comments,
              favorites: favorites,
              notices: notices,
              posts: posts,
              user: user,
            })
          })
        })
      })
    })
  })
})

router.get('/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  User.findOne({
    where: { id: req.user.id },
  }).then((user) => {
    //インスタンスを渡しているからemail.password等全て渡される
    res.render('mypage/edit', { user: user, csrfToken: req.csrfToken() })
  })
})

// 編集時の処理
router.post(
  '/edit',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    // ファイル が選択されなかった時の処理を追加
    if (req.files) {
      var filename = req.files.icon.name
      var icon_path = 'public/images/upload_icon/' + filename
      var s3 = new AWS.S3()
      var params = {
        Bucket: 'share-code.bucket',
        Key: `upload-icon/${filename}`,
      } //ファイルをアップロード
      fs.writeFile(icon_path, req.files.icon.data, (err) => {
        if (err) {
          console.log('エラーが発生しました' + err)
          throw err
        } else {
          var v = fs.readFileSync(icon_path)
          params.ContentType = req.files.icon.mimetype
          params.Body = v
          // AWS S3に保存
          s3.putObject(params, function (err, data) {
            if (err) {
              console.log('エラーが発生しました' + err)
              throw err
            } else {
              // データベースにアップデート
              User.update(
                {
                  name: req.body.name,
                  email: req.body.email,
                  password: req.body.password,
                  introduction: req.body.introduction,
                  iconFileName: req.files.icon.name,
                },
                { where: { id: req.user.id } },
              ).then(() => {
                res.redirect('/mypage')
              })
            }
          })
        }
      })
    } else {
      User.update(
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          introduction: req.body.introduction,
        },
        { where: { id: req.user.id } },
      ).then(() => {
        res.redirect('/mypage')
      })
    }
  },
)

// 退会処理
router.get('/delete', authenticationEnsurer, (req, res, next) => {
  User.findOne({ where: { id: req.user.id } }).then((user) => {
    user.destroy().then(() => {
      res.redirect('/')
    })
  })
})

// 投稿cardを削除する
router.get('/destroy/:postId', authenticationEnsurer, (req, res, next) => {
  Post.findOne({
    where: { id: req.params.postId },
  }).then((post) => {
    post.destroy().then(() => {
      res.redirect('/mypage')
    })
  })
})

module.exports = router
