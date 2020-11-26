const axios = require('axios');

$(function() {
  // 使用异步加载验证码
  function loadCaptcha() {
    axios.get('/admin/captcha?random=' + new Date().getTime())
      .then(function(response) {
        $('#captcha').attr('data-code', response.data.text).empty().append(response.data.data);
      })
      .catch(function(err) {
        console.log(err);
      })
  }

  loadCaptcha();

  // 点击刷新验证码
  $('#captcha').click(function() {
    loadCaptcha();
  });


  // 前端验证
  // 通过使用jQuery.validator.setDefaults()中的showErrors来捕获错误消息，通过submitHandler来提交表单
  $.validator.setDefaults({
    submitHandler: function() {
      axios.post('/admin/checklogin', {
        username: $('#username').val(),
        password: $('#password').val(),
        code: $('#code').val()
      }).then(function(response) {
        let errors = response.data.errors;
        // 要验证的元素
        let validatelements = new Set(['username', 'password','code']);
        // 显示错误消息的元素
        let errorElement = new Set();
        //console.log(errors);
        if (errors != 'success') {
          errors.forEach(item => {
            if (validatelements.has(item.param)) {
              item.param !== 'code' ? $(`#${item.param}`).attr({'data-content': item.msg}) && $(`#${item.param}`).popover('show') : $('#captcha').attr({'data-content': item.msg}) && $('#captcha').popover('show');
              errorElement.add(item.param);
            }
          });

          validatelements.forEach(value => {
            if (!errorElement.has(value)) {
              value != 'code' ? $(`#${value}`).popover('hide') : $('#captcha').popover('hide');
            }
          });
        } 
        else {
          window.location.href = '/blog/index';
        }
      }).catch(function(err) {
        if (err) {
          alert('用户名与密码不正确');
        }
      });
    },
    showErrors: function(errorMap, errorList) {
      // console.log(errorList); // 错误消息、元素 + popover 在指定的元素上显示相应的错误消息
      let idMaps = new Map([
        ['username', {showError: false, errorMsg: '用户名不符合要求'}],
        ['password', {showError: false, errorMsg: '密码不符合要求'}],
        ['code', {showError: false, errorMsg: '验证码不符合要求'}]
      ]);

      $.each(errorList, function(index, item) {
        if (idMaps.has(item.element.id)) {
          idMaps.set(item.element.id, {showError: true, errorMsg: item.message});
        }
      });

      idMaps.forEach((value, key) => {
        if (value.showError) {
          key != 'code' ? $(`#${key}`).attr({'data-content': value.errorMsg}) && $(`#${key}`).popover('show') : $('#captcha').attr({'data-content': value.errorMsg}) && $('#captcha').popover('show');
        } else {
          key != 'code' ? $(`#${key}`).popover('hide') : $('#captcha').popover('hide');
        }
      });
    }
  });

  $.validator.addMethod('verifyCode', function(value, element) {
    // 尝试：跟用户名是否存在的判断方法类似，实现验证码的判断
    let sessionCode = $("#captcha").attr('data-code');
    return sessionCode === value;
  }, '请输入正确的验证码');
// 用户输入的内容与自定义属性的值进行判断
  $("#loginForm").validate({
    rules: {
      username: {
        required: true,
        minlength: 8,
        maxlength: 20
      },
      password: {
        required: true,
        minlength: 6,
        maxlength: 16
      },
      code: {
        required: true,
        rangelength: [4, 4],
        verifyCode: ''
      }
    },
    messages: {
      username: {
        required: '用户名不能为空',
        minlength: '用户名的长度必须大于8位',
        maxlength: '用户名的长度必须小于20位'
      },
      password: {
        required: '密码不能为空',
        minlength: '密码的长度必须大于6位',
        maxlength: '密码的长度必须小于16位'
      },
      code: {
        required: '验证码不能为空',
        rangelength: '验证码的长度不对'
      }
    }
  });
});

