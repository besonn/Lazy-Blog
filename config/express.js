const express = require('express');
const glob = require('glob');
const ueditor = require("ueditor");
const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const path = require('path');
const moment = require('moment');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

module.exports = (app, config) => {
  // 导入Author
  const Author = require(config.root+'/app/models/author.js');
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'pug');
  app.use((req,res,next) =>{
    app.locals.moment=moment;
    next();
  });
  app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json({limit:'10000kb'}));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit:'10000kb'
  }));
  app.use(session({
    secret: 'hands by hands key',
    resave: false,
    saveUninitialized: true
  }));
  app.use(cookieParser());

  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(compress());
  app.use(express.static(config.root + '/public'));


  // 将下载的第三方库添加到静态资源 路径当中，方便访问
  app.use('/jquery', express.static(config.root + '/node_modules/jquery/dist'));
  app.use('/fontawesome', express.static(config.root + '/node_modules/@fortawesome/fontawesome-free'));
  app.use('/bootstrap', express.static(config.root + '/node_modules/bootstrap/dist'));
  app.use('/validation', express.static(config.root + '/node_modules/jquery-validation/dist'));
  app.use('/popper', express.static(config.root + '/node_modules/popper.js/dist'));
  app.use('/cropper',express.static(config.root + '/node_modules/cropperjs/dist'));
  app.use('/jquery-cropper',express.static(config.root + '/node_modules/jquery-cropper/dist'));
  app.use('/urlsearchparams',express.static(config.root + '/node_modules/urlsearchparams/types'));
  app.use('/qs',express.static(config.root + '/node_modules/qs/dist'));

  app.use(methodOverride());
  // passport config
  passport.use(new LocalStrategy(Author.authenticate()));
  passport.serializeUser(Author.serializeUser());
  passport.deserializeUser(Author.deserializeUser());
   // passport config
   passport.use(new LocalStrategy(Author.authenticate()));
   passport.serializeUser(Author.serializeUser());
   passport.deserializeUser(Author.deserializeUser());
 
   // 封装一个中间件函数到passport中，可以在需要拦截未验证的用户的一个请求的时候调用
   passport.authenticateMiddleware = function() {
     return function(req, res, next) {
       if (req.isAuthenticated()) {
         return next();
       }
       res.redirect('/admin/login');
     }
   };
   // ueditor 富文本编辑器
  app.use("/ueditor/ue", ueditor(path.join(__dirname, '../public'), function(req, res, next) {
    var imgDir = '/img/ueditor/' //默认上传地址为图片
    var ActionType = req.query.action;
      if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
          var file_url = imgDir;//默认上传地址为图片
          /*其他上传格式的地址*/
          if (ActionType === 'uploadfile') {
              file_url = '/file/ueditor/'; //附件保存地址
          }
          if (ActionType === 'uploadvideo') {
              file_url = '/video/ueditor/'; //视频保存地址
          }
          res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
          res.setHeader('Content-Type', 'text/html');
      }
    //客户端发起图片列表请求
    else if (ActionType === 'listimage'){

      res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
      res.setHeader('Content-Type', 'application/json');
      res.redirect('/ueditor/nodejs/config.json');
  }}));

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach((controller) => {
    require(controller)(app,passport);
  });

  app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });

  return app;
};
