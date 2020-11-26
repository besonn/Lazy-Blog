const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/author.js');
mongoose.connect("mongodb://localhost/myblog-development");
const config = require('../../config/config');
let Author = require(config.root+'/app/models/author');

const { body, validationResult } = require('express-validator');
const { resolve, reject } = require('promise');


module.exports = (app,passport) => {
  app.use('/admin', router);
  router.get('/register', (req, res, next) => {
    res.render('admin/register', {
      title: '用户登录'
    });
  });
  
  router.post('/checkreg', [
    body('username').isLength({min: 8, max: 20}).withMessage('用户名必须在8-20个字符之间')
      .matches(/^[A-Za-z]\w{7,19}$/i).withMessage('用户名不符合要求')
      .custom(value => {
        return new Promise((resolve, reject) => {
          Author.countDocuments({username: value}, function(err, count) {
            if (count > 0) {
              reject('用户名已经存在');
            }
            resolve(true);
          });
        })
      }),
      body('password').isLength({min: 6, max: 16}).withMessage('密码必须在6-16个字符之间')
        .matches(/^[A-Za-z]\w{5,15}$/i).withMessage('密码不符合要求'),
      body('repassword').isLength({min: 6, max: 16}).withMessage('密码必须 在6-16个字符之间')
        .matches(/^[A-Za-z]\w{5,15}$/i).withMessage('密码不符合要求')
        .custom((value, {req}) => {
          if (value !== req.body.password) {
            return Promise.reject('确认密码与密码不一致');
          }
          return true;
        }),
      body('code').isLength({min: 4, max: 4}).withMessage('验证码的长度不对')
        .custom((value, {req}) => {
          if (value !== req.session.captcha) {
            return Promise.reject('验证码不正确');
          }
          return true;
        })
  ], (req, res, next) => {
    const errors = validationResult(req);
    // 验证不通过
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array({onlyFirstError: true})});
    }
  
   // 将正确的用户名与密码插入数据库
   Author.register(new Author({username: req.body.username,portrait: '/img/header.jpg'}), req.body.password, function(err, author) {
    if (err) {
      return next(err);
    }
    return passport.authenticate('local')(req, res, function() {
      return res.json({errors: 'success'});
    });
  });
  });
  
  // 查询用户名是否存在
  router.get('/checkname', (req, res, next) => {
    // checkname?username=xxxxxx
    let username = req.query.username;
  
    Author.countDocuments({username:username},function(err,count){
      if(err){
        return next(err);
      }
      if(count>0){
        return res.json({status:1});
      }
      return res.json({status: 0});
    }); 
  });
  
};

