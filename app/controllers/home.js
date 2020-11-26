const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const async = require("async");
let Article = mongoose.model('Article');
let Comments = mongoose.model('Comments');

module.exports = (app) => { 
  app.use('/blog', router);
};



// 分页
// 总记录数(estimatedDocumentCount())，每页显示的记录数   总页数

// mongoose中的查询属于异步，第三方框架：async
// 按指定顺序执行并传递参数的方法：waterfall()
router.get('/index/:page?', (req, res, next) => {
  // 分页
  let pages = 6; // 每页显示的记录数
  let page = Number.parseInt(req.params.page || 1);
//  1、查询总的记录数

  async.waterfall([
    function(callback) {
      Article.estimatedDocumentCount().then(totalCount => callback(null, totalCount));
    },
    function(totalCount, callback) {
      let totalPage = Math.ceil(totalCount / pages);

      if (page < 1) {
        page = 1;
      }

      if (page > totalPage) {
        page = totalPage;
      }
      //  2、根据每页显示的记录数，实现分页

      Article.find() // 默认查询 出来的是mongoose对象
        .sort({publishTime: -1})
        .skip((page - 1) * pages)
        .limit(pages)
        .populate('author')
        .populate('category')
        .lean() // 将查询的mongoose对象变成普通对象
        .exec((err, articles) => {
          if (err) {
            return next(err);
          }
          callback(null, articles, totalPage, page);
        });
    }//  3、添加每篇博客的评论数量

  ], async function(err, articles, totalPage, page) {
    let newArticles = await Promise.all(articles.map(async article => {
      article.commentCount = await Comments.countDocuments({posts: article._id});
      return article;
    }));
    if (err) {
      return next(err);
    }
    //  4、前端渲染显示
    res.render('blog/index', {
      title: 'Lazy Blog首页',
      articles: newArticles,
      totalPage: totalPage,
      page: page,
      user : req.user
    });
  });
});

