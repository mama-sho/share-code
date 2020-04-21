'use strict'
//  読み込み
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
require('date-utils')

// aws s3 のコンフィグ設定 は'app.js'で指定済み
//  /singup　にアクセスされた時の処理
router.get('/', (req, res, next) => {
  res.render('signup')
})

router.post('/', (req, res, next) => {
  // パスを変数に入れる
  console.log(req.files)

  var filename = req.files.icon.name
  var icon_path = 'public/images/upload_icon/' + filename
  var s3 = new AWS.S3()
  var params = {
    Bucket: 'share-code.bucket',
    Key: `upload-icon/${filename}`,
  }
  fs.writeFile(icon_path, req.files.icon.data, err => {
    if (err) {
      console.log('エラーが発生しました' + err)
      throw err
    } else {
      // S3 バケットのファイルに保存
      var v = fs.readFileSync(icon_path)
      params.ContentType = req.files.icon.mimetype
      params.Body = v
      s3.putObject(params, function(err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          // DB にファイル名等保存
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            introduction: req.body.profile,
            iconFileName: req.files.icon.name,
          }).then(() => {
            res.redirect('/login')
          })
        }
      })
    }
  })
})

module.exports = router
