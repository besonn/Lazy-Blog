const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');

module.exports = (app, passport) => {
  router.get('/password', passport.authenticateMiddleware(), (req, res, next) => {
    res.render('admin/password', {
      title: '后台管理--修改密码',
      user: req.user
    });
  });

  router.post('/changepwd', passport.authenticateMiddleware(), [
    body('old_password').isLength({min: 6, max: 16}).withMessage('密码必须在6-16个字符之间')
      .matches(/^[A-Za-z]\w{5,15}$/i).withMessage('密码不符合要求')
      .custom((value, {req}) => {
        return req.user.authenticate(value).then(val => {
          if (!val.user) {
            return Promise.reject('旧密码输入不正确');
          }
          return true;
        });
      }),
    body('new_password').isLength({min: 6, max: 16}).withMessage('新密码必须在6-16个字符之间')
      .matches(/^[A-Za-z]\w{5,15}$/i).withMessage('新密码不符合要求'),
    body('confirm_password').isLength({min: 6, max: 16}).withMessage('确认密码必须 在6-16个字符之间')
      .matches(/^[A-Za-z]\w{5,15}$/i).withMessage('确认密码不符合要求')
      .custom((value, {req}) => {
        if (value !== req.body.new_password) {
          return Promise.reject('确认密码与新密码不一致');
        }
        return true;
      })
  ], (req, res, next) => {
    const errors = validationResult(req);
    // 验证不通过
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array({onlyFirstError: true})});
    }

    return req.user.changePassword(req.body.old_password, req.body.new_password).then(value => {
      return res.json({errors: 'success'});
    }).catch(err => {
      if (err) {
        return next(err);
      }
    });
  });

  // 检查旧密码是否正确
  router.get('/checkOldPwd', passport.authenticateMiddleware(), async (req, res, next) => {
    let result = await req.user.authenticate(req.query.old_password);
    return res.json(result);
  });

  app.use('/admin', router);
};


