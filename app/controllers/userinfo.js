const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Author = mongoose.model('Author');

module.exports = (app, passport) => {
  router.get('/userinfo', passport.authenticateMiddleware(), (req, res, next) => {
    res.render('admin/userinfo', {
      title: '后台管理--修改个人资料',
      user: req.user
    });
  });

  router.post('/modifyInfo', passport.authenticateMiddleware(), async (req, res, next) => {
    const result = await Author.updateOne({_id: req.user._id}, {nickname: req.body.nickname, email: req.body.email, intro: req.body.intro});
    if (result.nModified) {
      res.redirect('/admin/userinfo');
    }
  });

  app.use('/admin', router);
};


