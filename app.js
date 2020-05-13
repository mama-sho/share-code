//　外部モジュールの読み込み
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var helmet = require('helmet')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var session = require('express-session')

//今回追加したもの
var fileupload = require('express-fileupload')

var AWS = require('aws-sdk')

// aws コンフィグ設定
AWS.config.loadFromPath('./rootkey.env')
AWS.config.update({ region: 'ap-northeast-1' }) // 日本東京

//  モデルファイルの読み込み
var Notice = require('./models/notice')
var User = require('./models/user')
var Post = require('./models/post')
var Favorite = require('./models/favorite')
var Comment = require('./models/comment')

//リレーションの設定 エンティティ同士を定義する　sequelizeでテーブルを結合できる
User.sync().then(() => {
  Post.belongsTo(User, { foreignKey: 'userId' })
  Post.sync()
  Favorite.belongsTo(User, { foreignKey: 'userId' })
  Favorite.sync()
  Comment.belongsTo(User, { foreignKey: 'userId' })
  Comment.sync()
  Notice.sync()
})
Post.sync().then(() => {
  Favorite.belongsTo(Post, { foreignKey: 'postId' })
  Favorite.sync()
})

// ログイン処理　ログイン成功したuserが渡されている
//第二引数に渡すものがセッションに保存されるreq.userになる
passport.serializeUser(function (user, done) {
  done(null, { id: user.id, email: user.email, name: user.name })
})

passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    }, //emailで検索
    function (username, password, done) {
      User.findOne({ where: { email: username } })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'ユーザーIDが間違っています。',
            })
          } //valid…パスワードを比較
          if (user.password !== password) {
            return done(null, false, {
              message: 'パスワードが間違っています。',
            })
          } // username passwordがあってると次の処理doneへ値を渡している
          return done(null, user)
        })
        .catch((err) => {
          return done(err)
        })
    },
  ),
)

// routerファイルの読み込み
var indexRouter = require('./routes/index')
var loginRouter = require('./routes/login')
var postsRouter = require('./routes/posts')
var signupRouter = require('./routes/signup')
var mypageRouter = require('./routes/mypage')
var logoutRouter = require('./routes/logout')
var favoriteRouter = require('./routes/favorites')
var user_listRouter = require('./routes/user-list')

var app = express()
app.use(helmet())

// viewの設定 ejsを使うことを宣言している
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// その他、使用することを宣言
app.use(fileupload())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(
  session({
    secret: 'd74604a511db109f',
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/login', loginRouter)
app.use('/posts', postsRouter)
app.use('/signup', signupRouter)
app.use('/mypage', mypageRouter)
app.use('/logout', logoutRouter)
app.use('/favorite', favoriteRouter)
app.use('/user-list', user_listRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
