'use strict'
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Notice = require('../models/notice')
const authenticationEnsurer = require('./authentication-ensurer')
const AWS = require('aws-sdk')
const fs = require('fs')
require('date-utils')

//include
router.get('/', authenticationEnsurer, (req, res, next) => {
  // 確認したい所
  Notice.findAll({
    where: { id: req.user.id },
  }).then(notice => {
    Post.findAll({
      include: [
        {
          model: User,
          where: { id: req.user.id },
        },
      ],
    }).then(posts => {
      User.findOne({ where: { id: req.user.id } }).then(user => {
        //renderの第二引数で値をテンプレートエンジンに渡している フォルダ名の指定でindexが読み込まれている
        res.render('mypage', { notice: notice, posts: posts, user: user })
      })
    })
  })
})

router.get('/edit', authenticationEnsurer, (req, res, next) => {
  User.findOne({
    where: { id: req.user.id },
  }).then(user => {
    //インスタンスを渡しているからemail.password等全て渡される
    res.render('mypage/edit', { user: user })
  })
})

// 編集時の処理
router.post('/edit', authenticationEnsurer, (req, res, next) => {
  var filename = req.files.icon.name
  var icon_path = 'public/images/upload_icon/' + filename
  var s3 = new AWS.S3()
  var params = {
    Bucket: 'share-code.bucket',
    Key: `upload-icon/${filename}`,
  } //ファイルをアップロード
  fs.writeFile(icon_path, req.files.icon.data, err => {
    if (err) {
      console.log('エラーが発生しました' + err)
      throw err
    } else {
      var v = fs.readFileSync(icon_path)
      params.ContentType = req.files.icon.mimetype
      params.Body = v
      // AWS S3に保存
      s3.putObject(params, function(err, data) {
        if (err) {
          console.log('エラーが発生しました' + err)
          throw err
        } else {
          // データベースに保存
          User.update({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            introduction: req.body.introduction,
            iconFileName: req.files.icno.name,
          }).then(() => {
            res.render('/mypage')
          })
        }
      })
    }
  })
})

// 削除
router.get('/delete', authenticationEnsurer, (req, res, next) => {
  User.findOne({ where: { id: req.user.id } }).then(user => {
    user.destroy().then(() => {
      res.redirect('/')
    })
  })
})
module.exports = router
