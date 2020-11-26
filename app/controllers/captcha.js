const express = require('express');
const router = express.Router();
var svgCaptcha = require('svg-captcha');

module.exports = (app) => {
  app.use('/admin', router);
};

router.get('/captcha', (req, res, next) => {
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text; // 需要使用express-session
  // res.type('svg');
  res.status(200).send(captcha);
});
