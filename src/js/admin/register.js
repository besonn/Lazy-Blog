const axios = require('axios');
const qs = require('qs');
const params = new URLSearchParams();
params.append('key', 'value');

$(function() {
  // 使用异步加载验证码，还有点击验证码时实现刷新验证码的功能
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
  // 通过使用jQuery.validator.setDefaults()来捕获错误消息，通过submitHandler来提交表单
  $.validator.setDefaults({
    submitHandler: function() {
      /*
      $.ajax({
        type: 'POST',
        url: '/admin/checkreg',
        data: {"username": $('#username').val(),"password": $('#password').val(),"repassword": $('#repassword').val(),"code":$('#code').val()},
        dataType: 'json',
        async: false
      })*/
      axios.post('/admin/checkreg', {
        username: $('#username').val(),
        password: $('#password').val(),
        repassword: $('#repassword').val(),
        code: $('#code').val()
      }).then(function(response) {
        let errors = response.data.errors;
        // 要验证的元素
        let validatelements = new Set(['username', 'password', 'repassword', 'code']);
        // 显示错误消息的元素
        let errorElement = new Set();
        console.log(errors);
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

        } else {
          console.log("66666");
          window.location.href = 'http://localhost:3000/admin/login';
        }

      }); 
/*
      params.append('username', $('#username').val());
      params.append('username', $('#username').val());
      params.append('repassword', $('#repassword').val());
      params.append('code', $('#code').val());
*/
      
    },
    showErrors: function(errorMap, errorList) {
      // console.log(errorList); // 错误消息、元素 + popover 在指定的元素上显示相应的错误消息
      let idMaps = new Map([
        ['username', {showError: false, errorMsg: '用户名不符合要求'}],
        ['password', {showError: false, errorMsg: '密码不符合要求'}],
        ['repassword', {showError: false, errorMsg: '确认密码不符合要求'}],
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



  // 通过jQuery.validator.addMethod()来验证用户名与密码是否满足条件
  $.validator.addMethod('checkname', function(value, element) {
    // 判断用户名是否存在
    // 使用ajax同步查询
    const response = $.ajax({
      type: 'GET',
      url: '/admin/checkname',
      data: 'username=' + value + '&time=' + new Date().getTime(),
      dataType: 'json',
      async: false
    }).responseJSON;

    if (!!response.status) {
      return false;
    }
                                    // 判断用户名是否满足要求
    return this.optional(element) || /^[A-Za-z]\w{7,19}$/i.test(value);
  }, '用户名已经存在或者不符合要求');

  $.validator.addMethod('checkpwd', function(value, element) {
    return this.optional(element) || /^[A-Za-z]\w{5,15}$/i.test(value);
  }, '密码不符合要求');

  $.validator.addMethod('verifyCode', function(value, element) {
    let sessionCode = $("#captcha").attr('data-code');
    return sessionCode === value;
  }, '请输入正确的验证码');
// 尝试：跟用户名是否存在的判断方法类似，实现验证码的判断
  $("#registerForm").validate({
    rules: {
      username: {
        required: true,
        minlength: 8,
        maxlength: 20,
        checkname: ''
      },
      password: {
        required: true,
        minlength: 6,
        maxlength: 16,
        checkpwd: ''
      },
      repassword: {
        required: true,
        minlength: 6,
        maxlength: 16,
        checkpwd: '',
        equalTo: '#password'
      },
      code: {
        required: true,
        rangelength: [4, 4],
        verifyCode: ''
      }
    },
     // 用户输入的内容与自定义属性的值进行判断
    messages: {
      username: {
        required: '用户名不能为空',
        minlength: '用户名的长度必须大于8位',
        maxlength: '用户名的长度必须小于20位'
      },
      password: {
        required: '密码不能为空',
        minlength: '用户名的长度必须大于6位',
        maxlength: '用户名的长度必须小于16位'
      },
      repassword: {
        required: '确认密码不能为空',
        minlength: '用户名的长度必须大于6位',
        maxlength: '用户名的长度必须小于16位',
        equalTo: '确认密码与密码不一致'
      },
      code: {
        required: '验证码不能为空',
        rangelength: '验证码的长度不对'
      }
    }
  });



});
