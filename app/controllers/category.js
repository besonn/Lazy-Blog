const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Article = mongoose.model('Article');
const async = require('async');
const { body, validationResult } = require('express-validator');

module.exports = (app, passport) => {
  router.get('/category', passport.authenticateMiddleware(), (req,  res, next) => {
    // 查询分类信息，并在article表中根据分类id查询博客数量
    async.waterfall([
      function(callback) {
        Category.find({author: req.user._id}).lean().then(categories => callback(null, categories));
      },
      function(categories, callback) {
        Promise.all(categories.map(async category => {
          let count = await Article.countDocuments({category: category._id});
          category['articleCount'] = count;
          return  category;
        })).then(categoriess => callback(null, categoriess));
      }
    ], function(err, result) {
      if (err) {
        return next(err);
      }
      res.render('admin/category', {
        title: '后台管理--博客分类',
        user: req.user,
        categories: result
      });
    });
  });


  router.post('/modifyCategory', passport.authenticateMiddleware(), [
    body('category').not().isEmpty().withMessage('博客分类不能为空')
  ], (req, res, next) => {
    const errors = validationResult(req);
    // 验证不通过
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array({onlyFirstError: true})});
    }

    let category = req.body.category;
    let categoryId = req.body.categoryId;

    if (!categoryId) {
      Category.insertMany([{
        name: category,
        author: req.user._id
      }], function(err, categories) {
        if (err) {
          return next(err);
        }
        if (categories.length) {
          return res.json({errors: 'success'});
        }
      });
    } else {
      Category.updateOne({_id: categoryId, author: req.user._id}, {name: category}, function(err, result) {
        if (err) {
          return next(err);
        }
        if (result.nModified) {
          return res.json({errors: 'success'});
        }
      });
    }
  });

  // 删除
  router.get('/delCategory', passport.authenticateMiddleware(), (req, res, next) => {
    Article.deleteMany({category: req.query.categoryId, author: req.user._id}, function(err) {
      if (err) {
        return next(err);
      }
      Category.deleteOne({_id: req.query.categoryId, author: req.user._id}, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/admin/category');
      });
    });
  });

  app.use('/admin', router);
};
