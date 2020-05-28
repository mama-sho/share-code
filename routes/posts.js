'use strict'
const express = require('express')
const router = express.Router()
const authenticationEnsurer = require('./authentication-ensurer')

const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

const Sequelize = require('sequelize')
const Op = Sequelize.Op

//　モデルの読み込み
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const Favorite = require('../models/favorite')
const Noitce = require('../models/notice')
const fs = require('fs')
const AWS = require('aws-sdk')
require('date-utils')

//　card作成ページ 認証機能 、User findOneで一つだけ取得、whereで条件絞り込み
router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  //今まで自分が投降したコード進行を表示する
  User.findOne({
    where: { id: req.user.id },
  }).then((user) => {
    res.render('post/new', { user: user, csrfToken: req.csrfToken() })
  })
})
//   audioファイルの保存を追加
router.post('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (req.files) {
    Post.create({
      songName: req.body.songName,
      isMajor: req.body.isMajor,
      isOriginal: req.body.isOriginal,
      progKey: req.body.progKey,
      codeProg: req.body.codeProg,
      memo: req.body.memo,
      userId: req.user.id,
    }).then((post) => {
      var filename = req.files.audio.name
      var audio_path = 'public/audio/upload_audio/' + filename
      var s3 = new AWS.S3()
      var params = {
        Bucket: 'share-code.bucket',
        Key: `audio/${req.user.id}/${filename}`,
      }
      fs.writeFile(audio_path, req.files.audio.data, (err) => {
        if (err) {
          console.log('エラーが発生しました' + err)
          throw err
        } else {
          var v = fs.readFileSync(audio_path)
          params.ContentType = req.files.audio.mimetype
          params.Body = v
          s3.putObject(params, function (err, data) {
            if (err) {
              console.log(err, err.stack)
              throw err
            } else {
              Post.update(
                {
                  audioFileName: `${req.user.id}/${req.files.audio.name}`,
                },
                { where: { id: post.id } },
              ).then(() => {
                fs.unlink(audio_path, (err) => {
                  if (err) {
                    throw err
                  }
                })
                res.redirect('/mypage')
              })
            }
          })
        }
      })
    })
  } else {
    Post.create({
      songName: req.body.songName,
      isMajor: req.body.isMajor,
      isOriginal: req.body.isOriginal,
      progKey: req.body.progKey,
      codeProg: req.body.codeProg,
      memo: req.body.memo,
      userId: req.user.id,
      audioFileName: 'no-audio',
      //音源を登録するところを実装したい
    }).then(() => {
      res.redirect('/mypage')
    })
  }
})

// 詳細ページ urlのパラメーターを受け取る　req.paramsで受け取れる
// is reed機能　追加したい
router.get('/:id', csrfProtection, (req, res, next) => {
  Post.findOne({
    include: [
      {
        model: User,
      },
    ],
    where: { id: req.params.id },
  }).then((post) => {
    Comment.findAll({
      include: [
        {
          model: User,
        },
      ],
      where: { postId: req.params.id },
    }).then((comments) => {
      Favorite.findAll().then((favorites) => {
        post.favoriteCount = favorites.filter(
          (v) => post.id === v.postId,
        ).length
        if (req.user) {
          // isreed機能 の追加   この状態だとどの投稿を見ても、全ての通知がtrueになってしまう
          Noitce.update(
            {
              isReed: true,
            },
            { where: { receiverId: req.user.id, targetId: post.id } },
          ).then(() => {
            post.isFavorite = favorites.some((favorite) => {
              return (
                favorite.userId === req.user.id && post.id === favorite.postId
              )
            })
            User.findOne({ where: { id: req.user.id } }).then((user) => {
              res.render('post/detail', {
                post: post,
                comments: comments,
                user: user,
                favorites: favorites,
                csrfToken: req.csrfToken(),
              })
            })
          })
        } else {
          // ログイン状態でなくとも、userを渡す…
          req.user = { id: null }
          post.isFavorite = favorites.some((favorite) => {
            return (
              favorite.userId === req.user.id && post.id === favorite.postId
            )
          })
          res.render('post/detail', {
            post: post,
            comments: comments,
            favorites: favorites,
            user: req.user,
            csrfToken: req.csrfToken(),
          })
        }
      })
    })
  })
})

// コメントの投稿処理
router.post(
  '/comment',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Comment.create({
      postId: req.body.postId,
      userId: req.body.userId,
      content: req.body.content,
    }).then(() => {
      Post.findOne({
        where: { id: req.body.postId },
      }).then((post) => {
        Noitce.create({
          senderId: req.user.id, //ログイン状態の人
          receiverId: post.userId, // 受信者
          targetId: req.body.postId, //どの投稿に対してのcommenntか
          isReed: false,
          type: 'comment',
        }).then(() => {
          res.json({ result: true })
        })
      })
    })
  },
)

//  コメント削除機能
router.post('/delete', authenticationEnsurer, (req, res, next) => {
  Comment.destroy({
    where: {
      [Op.or]: {
        id: req.body.id,
        replyId: req.body.id,
      },
    },
  }).then(() => {
    res.json({ result: true })
  })
})

// 返信機能replry
router.post(
  '/reply',
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Comment.create({
      postId: req.body.postId,
      userId: req.user.id,
      content: req.body.reply_content,
      replyId: req.body.replyId,
    }).then(() => {
      res.json({ result: true })
    })
  },
)

module.exports = router
