const axios = require('axios');

$(function() {
  let $image = $('#image');
  let $inputImage = $("#inputImage");
  let URL = window.URL || window.webkitURL;
  let uploadedImageType = 'image/jpeg';
  let uploadedImageURL;

  let cropBoxData;
  let canvasData;
  let cropper;
  let options = {
    aspectRatio: 1 / 1,
    preview: '.img-preview'
  };

  // 弹出模态框的时候才加载cropper
  $('#editportrait').on('shown.bs.modal', function() {
    // 加载cropper
    $image.cropper(options);

    if (!$image.data('cropper')) {
      return;
    }

    cropper = $image.data('cropper');

    cropBoxData = $image.cropper('getCropBoxData');
    canvasData = $image.cropper('getCanvasData');

    options.ready = function () {
      $image.cropper('setCropBoxData', cropBoxData);
      $image.cropper('setCanvasData', canvasData);
    };

    $inputImage.change(function () {
      var files = this.files;
      var file;

      if (!$image.data('cropper')) {
        return;
      }

      if (files && files.length) {
        file = files[0];

        if (/^image\/\w+$/.test(file.type)) {
          uploadedImageName = file.name;
          uploadedImageType = file.type;

          if (uploadedImageURL) {
            URL.revokeObjectURL(uploadedImageURL);
          }

          uploadedImageURL = URL.createObjectURL(file);
          $image.cropper('destroy').attr('src', uploadedImageURL).cropper(options);
          $inputImage.val('');
        }
      }
    });
  }).on('hidden.bs.modal', function() {
    cropBoxData = cropper.getCropBoxData();
    canvasData = cropper.getCanvasData();
  });

  $('.docs-buttons').on('click', '[data-method]', function () {
    var $this = $(this);
    var data = $this.data();
    var cropper = $image.data('cropper');
    var cropped;
    var $target;

    if ($this.prop('disabled') || $this.hasClass('disabled')) {
      return;
    }

    if (cropper && data.method) {
      data = $.extend({}, data); // Clone a new one

      if (typeof data.target !== 'undefined') {
        $target = $(data.target);

        if (typeof data.option === 'undefined') {
          try {
            data.option = JSON.parse($target.val());
          } catch (e) {
            console.log(e.message);
          }
        }
      }

      cropped = cropper.cropped;

      switch (data.method) {
        case 'rotate':
          if (cropped && options.viewMode > 0) {
            $image.cropper('clear');
          }

          break;
      }

      result = $image.cropper(data.method, data.option, data.secondOption);

      switch (data.method) {
        case 'rotate':
          if (cropped && options.viewMode > 0) {
            $image.cropper('crop');
          }

          break;

        case 'scaleX':
        case 'scaleY':
          $(this).data('option', -data.option);
          break;
      }
    }
  });


  $('#modify').on('click', function() {
    let result = $image.cropper('getCroppedCanvas', {fillColor: '#fff'});

    $('#portrait').attr('src', result.toDataURL(uploadedImageType));

    // 将头像数据发送到后台更新
    axios.post('/admin/updatePortrait', {
      portrait: result.toDataURL(uploadedImageType)
    });

    $('#editportrait').modal('hide');
  });

});
