const axios = require('axios');

$(function() {

  // 前端验证
  // 通过使用jQuery.validator.setDefaults()中的showErrors来捕获错误消息，通过submitHandler来获取表单提交的信息
  $.validator.setDefaults({
    submitHandler: function() {
      // 提交表单
      axios.post('/admin/changepwd', {
        old_password: $('#old_password').val(),
        new_password: $('#new_password').val(),
        confirm_password: $('#confirm_password').val()
      }).then(function(response) {
        let errors = response.data.errors;
        // 要验证的元素
        let validatelements = new Set(['old_password', 'new_password', 'confirm_password']);
        // 显示错误消息的元素
        let errorElement = new Set();

        if (errors != 'success') {
          errors.forEach(item => {
            if (validatelements.has(item.param)) {
              $(`#${item.param}`).attr({'data-content': item.msg}) && $(`#${item.param}`).popover('show');

              errorElement.add(item.param);
            }
          });

          validatelements.forEach(value => {
            if (!errorElement.has(value)) {
              $(`#${value}`).popover('hide');
            }
          });

        } else {
          alert('修改成功，请重新登录 ！');
          window.location.href = '/admin/logout-login';
        }
      });
    },
    showErrors: function(errorMap, errorList) {
      // console.log(errorList); // 错误消息、元素 + popover 在指定的元素上显示相应的错误消息
      let idMaps = new Map([
        ['old_password', {showError: false, errorMsg: '密码不符合要求'}],
        ['new_password', {showError: false, errorMsg: '新密码不符合要求'}],
        ['confirm_password', {showError: false, errorMsg: '确认密码不符合要求'}]
      ]);

      $.each(errorList, function(index, item) {
        if (idMaps.has(item.element.id)) {
          idMaps.set(item.element.id, {showError: true, errorMsg: item.message});
        }
      });

      idMaps.forEach((value, key) => {
        if (value.showError) {
          $(`#${key}`).attr({'data-content': value.errorMsg}) && $(`#${key}`).popover('show');
        } else {
          $(`#${key}`).popover('hide');
        }
      });
    }
  });

  // 判断用户输入的旧密码是否正确
  $.validator.addMethod('checkOldPwd', function(value, element) {
    const response = $.ajax({
      type: 'GET',
      url: '/admin/checkOldPwd',
      data: 'old_password=' + value + '&time=' + new Date().getTime(),
      dataType: 'json',
      async: false
    }).responseJSON;

    if (!response.user) {
      return false;
    }
    return true;
  }, '旧密码输入不正确');

  $.validator.addMethod('checkpwd', function(value, element) {
    return this.optional(element) || /^[A-Za-z]\w{5,15}$/i.test(value);
  }, '密码不符合要求');

  $("#pwdForm").validate({
    rules: {
      old_password: {
        required: true,
        minlength: 6,
        maxlength: 16,
        checkpwd: '',
        checkOldPwd: ''
      },
      new_password: {
        required: true,
        minlength: 6,
        maxlength: 16,
        checkpwd: ''
      },
      confirm_password: {
        required: true,
        minlength: 6,
        maxlength: 16,
        checkpwd: '',
        equalTo: '#new_password'
      }
    },
    messages: {
      old_password: {
        required: '密码不能为空',
        minlength: '密码的长度必须大于6位',
        maxlength: '密码的长度必须小于16位'
      },
      new_password: {
        required: '新密码不能为空',
        minlength: '新密码的长度必须大于6位',
        maxlength: '新密码的长度必须小于16位'
      },
      confirm_password: {
        required: '确认密码不能为空',
        minlength: '确认密码的长度必须大于6位',
        maxlength: '确认密码的长度必须小于16位',
        equalTo: '确认密码与新密码不一致'
      }
    }
  });
});
