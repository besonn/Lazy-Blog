const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const async = require("async");
let Article = mongoose.model('Article');

module.exports = (app, passport) => {
  router.get('/bloglist/:page?', passport.authenticateMiddleware(), (req, res, next) => {
    // 分页
  let pages = 4; // 每页显示的记录数
  let page = Number.parseInt(req.params.page || 1);

  async.waterfall([
    function(callback) {
      Article.countDocuments({author: req.user._id}, function(err, count) {
        if (err) {
          return next(err);
        }
        callback(null, count);
      })
    },
    function(totalCount, callback) {
      let totalPage = Math.ceil(totalCount / pages);

      if (page < 1) {
        page = 1;
      }

      if (page > totalPage) {
        page = totalPage;
      }

      Article.find({author: req.user._id}) // 默认查询 出来的是mongoose对象
        .sort({publishTime: -1})
        .skip((page - 1) * pages)
        .limit(pages)
        .exec((err, articles) => {
          if (err) {
            return next(err);
          }
          callback(null, articles, totalPage, page);
        });
    }
  ], function(err, articles, totalPage, page) {
    if (err) {
      return next(err);
    }
    res.render('admin/bloglist', {
      title: '后台管理--博客列表',
      articles: articles,
      totalPage: totalPage,
      page: page,
      user: req.user
    });
  });
});

router.get('/delBlog/:id/:page?', passport.authenticateMiddleware(), (req, res, next) => {
  let id = req.params.id;
  let page = Number.parseInt(req.params.page || 1);

  Article.deleteOne({_id: id, author: req.user._id}, function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/bloglist/' + page);
  })
});

  app.use('/admin', router);
};

