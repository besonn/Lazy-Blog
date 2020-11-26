const axios = require('axios');

$(function() {
  global.addComment = function() {
    axios.post('/blog/addComment', {
      text: $('#commentText').val(),
      posts: $('#articleId').val()
    }).then(function(response) {
      let status = response.data.status;
      if (status == 'success') {
        // 发表评论后，加载整个页面，比较消耗性能
        // 建议使用ajax实现局部刷新
        window.location.reload();
      }
    });
  };
});
