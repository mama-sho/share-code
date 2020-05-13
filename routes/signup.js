'use strict'
//  読み込み
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const AWS = require('aws-sdk')
const fs = require('fs')

const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })

require('date-utils')

// aws s3 のコンフィグ設定 は'app.js'で指定済み
//  /singup　にアクセスされた時の処理
router.get('/', csrfProtection, (req, res, next) => {
  res.render('signup', { csrfToken: req.csrfToken() })
})

router.post('/', csrfProtection, (req, res, next) => {
  if (req.files) {
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      introduction: req.body.profile,
    }).then((user) => {
      var filename = req.files.icon.name
      var icon_path = 'public/images/upload_icon/' + filename
      var s3 = new AWS.S3()
      var params = {
        Bucket: 'share-code.bucket',
        Key: `upload-icon/${user.id}/${filename}`,
      }
      fs.writeFile(icon_path, req.files.icon.data, (err) => {
        if (err) {
          console.log('エラーが発生しました' + err)
          throw err
        } else {
          // S3 バケットのファイルに保存
          var v = fs.readFileSync(icon_path)
          params.ContentType = req.files.icon.mimetype
          params.Body = v
          s3.putObject(params, function (err, data) {
            if (err) {
              console.log(err, err.stack)
            } else {
              // DB にファイル名等保存
              User.update(
                {
                  iconFileName: `${user.id}/${req.files.icon.name}`,
                },
                { where: { id: user.id } },
              ).then(() => {
                // ローカルのファイルを消す
                fs.unlink(icon_path, (err) => {
                  if (err) {
                    throw err
                  }
                })
                res.redirect('/login')
              })
            }
          })
        }
      })
    })
  } else {
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      introduction: req.body.profile,
      iconFileName: 'no-iamge.png',
    }).then(() => {
      res.redirect('/login')
    })
  }
})

module.exports = router
