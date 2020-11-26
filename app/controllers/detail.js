const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const async = require("async");
let Article = mongoose.model('Article');
let Comments = mongoose.model('Comments');

module.exports = (app, passport) => {
  router.post('/addComment', passport.authenticateMiddleware(), (req, res, next) => {
    Comments.create({
      text: req.body.text,
      poster: req.user._id,
      posts: req.body.posts
    }).then(function(comments) {
      if (comments) {
        return res.json({status: 'success'});
      }
    });
  });


  app.use('/blog', router);
};


// 博客详情
// 1、博客内容（作者）,当用户查看博客内容时，阅读量+1
router.get('/detail/:id', (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return next(new Error('请传入正确的博客编号'));
  }
  // 2、评论

  async.waterfall([
    function(callback) {
      Article.findById(id).populate('author').exec((err, article) => {
        if (err) {
          return next(err);
        }

        article.reading += 1;

        // 将数据保存到数据库（更新数据库）
        article.save((err, updateArticle) => {
          if (err) {
            return next(err);
          }
          callback(null, updateArticle);
        });
      });
    },
    // 3、作者相关信息

    function(article, callback) {
      // 按升序排序（如忘记，自己实现）
      Comments.find({posts: article._id}).populate('poster').exec((err, comments) => {
        if (err) {
          return next(err);
        }
        callback(null, article, comments);
      })
    },
    function(article, comments, callback) {
      Article.find({author: article.author._id}).exec((err, articles) => {
        let author = article.author;
        // 字数
        let wordCount = 0;
        // 博客数
        author.articleCount = articles.length;
        // 访问量
        let visitedCount = 0;
        // 遍历，计算字数和访问量
        articles.forEach(value => {
          wordCount += value.content.length;

          visitedCount += value.reading;
        });
        author.wordCount = wordCount / 10000;
        author.visitedCount = visitedCount;

        callback(null, article, comments, author);
      });
    },// 4、相关博客
    function(article, comments, author, callback) {
      Article.find({category: article.category}).limit(10).sort({publishTime: -1}).exec((err, articles) => {
        if (err) {
          return next(err);
        }
        callback(null, article, comments, author, articles);
      });
    }
  ],
  function(err, article, comments, author, articles) {
    if (err) {
      return next(err);
    }
    res.render('blog/detail', {
      title: 'Lazy Blog--博客详情页',
      article: article,
      comments: comments,
      author: author,
      articles: articles,
      user: req.user
    });
  });




});
