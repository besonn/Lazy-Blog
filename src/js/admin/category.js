const axios = require('axios');

$(function() {
  // 点击添加按钮，显示输入框
  $('#btn-add').click(function() {
    $('#add-category').fadeIn('normal', 'linear');
  });

  // 修改博客分类
  global.changeCategory = function (obj, categoryId) {
    let name = $(obj).parent().siblings('td').first().text();
    $('#add-category').fadeIn('normal', 'linear');

    $('#category').val(name);
    $('#categoryId').val(categoryId);
  };

  // 删除
  global.delCategory = function(categoryId) {
    let msg = '删除博客分类将会删除该分类下的所有博客\n\n是否确认删除？';
    if (confirm(msg)) {
      window.location.href = `/admin/delCategory?categoryId=${categoryId}`;
    }
  }

  // 前端验证
  $.validator.setDefaults({
    submitHandler: function() {
      // 提交的时候分两种情况：添加一个新的分类/修改分类
      axios.post('/admin/modifyCategory', {
        category: $('#category').val(),
        categoryId: $('#categoryId').val()
      }).then(function(response) {
        let errors = response.data.errors;

        if (errors !== 'success') {
          $('#category').popover('show');
        } else {
          window.location.reload();
        }
      });
    },
    showErrors: function(errorMap, errorList) {
      if (errorList.length) {
        $('#category').popover('show');
      }else {
        $('#category').popover('hide');
      }
    }
  })

  $('#add-category').validate({
    rules: {
      category: {
        required: true
      }
    }
  })
});
