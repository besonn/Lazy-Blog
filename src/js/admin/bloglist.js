$(function() {
    global.delBlog = function(articleId, page) {
      let msg = '确认删除该条博客?';
      if (confirm(msg)) {
        window.location.href=`/admin/delBlog/${articleId}/${page}`;
      }
    };
  });
  