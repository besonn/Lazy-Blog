const axios = require('axios');

$(function() {
  const ue = UE.getEditor('editor');

  global.addBlog = function() {
    axios.post('/admin/addBlog', {
      blogId: $('#blogId').val(),
      title: $('#title').val(),
      category: $('#category').val(),
      summary: $('#summary').val(),
      content: ue.getContent(),
      page: $('#page').val()
    }).then(function(response) {
      let status = response.data.status;

      if (status == 'success') {
        let page = $('#page').val();
        if (page) {
          window.location.href='/admin/bloglist/' + page;
        }else {
          window.location.href='/admin/bloglist';
        }
      }
    });
  };
});
