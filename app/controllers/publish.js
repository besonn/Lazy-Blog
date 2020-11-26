const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Category = mongoose.model('Category');

module.exports = (app, passport) => {
  router.get('/publish/:articleId?/:page?', passport.authenticateMiddleware(), async (req, res, next) => {
    let articleId = req.params.articleId;
    let page = req.params.page;

    if (articleId && page) {
      page = Number.parseInt(page || 1);

      let categories = await Category.find({author: req.user._id});
      let article = await Article.findById(articleId);

      res.render('admin/publish', {
        title: '后台管理--发表博客',
        user: req.user,
        categories: categories,
        article: article,
        page: page
      });
    } else {
      // 进入发表博客的页面，其中的博客分类需要到数据库中查询
      Category.find({author: req.user._id}, function(err, categories) {
        if (err) {
          return next(err);
        }
        res.render('admin/publish', {
          title: '后台管理--发表博客',
          user: req.user,
          categories: categories
        });
      });
    }
  });

  router.post('/addBlog', passport.authenticateMiddleware(), (req, res, next) => {
    let blogId = req.body.blogId;
    let page = req.body.page;

    if (blogId && page) {
      // 更新
      Article.updateOne({_id: blogId}, {
        title: req.body.title,
        content: req.body.content,
        summary: req.body.summary,
        category: req.body.category
      }, function(err, result) {
        if (err) {
          return next(err);
        }
        if (result.nModified) {
          return res.json({status: 'success'});
        }
      });
    } else {
      // 新增
      // 省略服务端验证
      Article.create({
        title: req.body.title,
        content: req.body.content,
        summary: req.body.summary,
        author: req.user._id,
        category: req.body.category
      }, function(err) {
        if (err) {
          return next(err);
        }
        return res.json({status: 'success'});
      });
    }
  });

  app.use('/admin', router);
};
