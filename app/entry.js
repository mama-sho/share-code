'use strict'
import $ from 'jquery'
const global = Function('return this;')()
global.jQuery = $
import bootstrap from 'bootstrap'

// ajax　いいね処理
$('.favorite-button').each((i, e) => {
  const button = $(e)
  button.click(() => {
    const postId = button.data('post-id')
    const userId = button.data('user-id')
    const isFavorite = button.data('is-favorite')
    const nextFavorite = !isFavorite
    if (userId) {
      $.post('/favorite', { postId: postId, userId: userId }, (data) => {
        button.data('is-favorite', nextFavorite)
        const favoriteCountSpan = button.parent().find('.favorite-count')
        let favoriteCount = Number(favoriteCountSpan.text())
        if (isFavorite) {
          favoriteCount--
        } else {
          favoriteCount++
        }
        favoriteCountSpan.text(favoriteCount)

        // クラス替えたい
      })
    } else {
      location.href = '/login'
    }
  })
})

// ajax コメント送信機能
$('.comment-button').each((i, e) => {
  const btn = $(e)
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content')
  btn.click(() => {
    const postId = btn.data('post-id')
    const userId = btn.data('user-id')
    const usericonName = btn.data('icon-name')
    const userName = btn.data('user-name')
    const content = document.getElementById('content')
    var content_value = content.value
    var target = document.getElementById('comment-target')
    var text_target = document.getElementById('text-target')
    //　ヘッダーにcsrf-tokenを渡す。
    if (content_value.length !== 0) {
      $.ajaxSetup({
        headers: {
          'X-CSRF-TOKEN': token,
        },
      })
      $.post(
        '/posts/comment',
        { postId: postId, userId: userId, content: content_value },
        (data) => {
          var html = `<div class="col-2 col-md-1 mt-2"><img class="comment-icon"src="https://s3-ap-northeast-1.amazonaws.com/share-code.bucket/upload-icon/${usericonName}" alt=""/></div>`
          var html2 = `<div class="col-10 col-md-11 col-lg-10"><div class="row"><div class="col-12 comment-name pt-2">${userName}</div><div class="col-12"><p class="border border-success mt-2 rounded">${content_value}</p></div></div></div>`
          text_target.innerHTML = 'コメントが追加されました！リロード推奨'
          content.value = ''
          // ほんとは追加したい
          target.insertAdjacentHTML('beforeend', html + html2)
        },
      )
    } else {
      text_target.innerHTML = 'コメントが追加できませんでした'
    }
  })
})

//ajax コメント削除
$('.comment-delete').each((i, e) => {
  const comment_btn = $(e)
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content')
  comment_btn.click(() => {
    const commentId = comment_btn.data('comment-id')
    var target = document.getElementById(commentId)
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': token,
      },
    })
    $.post('/posts/delete', { id: commentId }, (data) => {
      target.remove()
    })
  })
})
