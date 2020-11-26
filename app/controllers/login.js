const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/author.js');
mongoose.connect("mongodb://localhost/myblog-development");
const config = require('../../config/config');
let Author = require(config.root+'/app/models/author');

const { body, validationResult } = require('express-validator');
const { resolve, reject } = require('promise');

module.exports = (app, passport) => {
  router.get('/login', (req, res, next) => {
    res.render('admin/login', {
      title: '用户登录'
    });
  });

  router.post('/checklogin', [
    body('username').not().isEmpty().withMessage('用户名不能为空'),
    body('password').not().isEmpty().withMessage('密码不能为空'),
    body('code').not().isEmpty().withMessage('验证码不能为空')
      .isLength({min: 4, max: 4}).withMessage('验证码的长度不正确')
      .custom((value, {req}) => {
        if (value !== req.session.captcha) {
          return Promise.reject('验证码不正确');
        }
        return true;
      })
  ], passport.authenticate('local', {failureRedirect: '/admin/login'}), (req, res, next) => {
    const errors = validationResult(req);
    // 验证不通过
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array({onlyFirstError: true})});
    }

    // 到数据库中查询，判断用户名是否存在
    // 权限管理，只允许登录的用户进行后台
    // passport
    req.session.save((err) => {
      if (err) {
          return next(err);
      }
      return res.json({errors: 'success'});
  });
  });
  // 退出到首页
  router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/blog/index');
  });
  // 退出到登录界面
  router.get('/logout-login', (req, res, next) => {
    req.logout();
    res.redirect('/admin/login');
  });
  
  app.use('/admin', router);
};