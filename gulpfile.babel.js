// 先整合babel，在运行项目


const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const plumber = require('gulp-plumber');
const named = require('vinyl-named');
const uglify = require('gulp-uglify-es').default;
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');
var babel = require("gulp-babel");
const glob =require('glob');
const path = require('path');
require('babel-polyfill');
const compiler = require('webpack');
const webpack = require('webpack-stream');
 
// -------------css编译---------------
let cssTasks =new Map();
// 读取src/main/*.scss
let cssFiles = glob.sync(__dirname +'/src/css/+(include|admin|blog)/*.scss');
cssFiles.forEach(cssFile=>{
  //给每一个文件添加一个task,不至于编译所有文件
  let  dest = path.dirname(cssFile.replace('src','public'));
  cssTasks.set(cssFile,function(cb){
    return gulp.src(cssFile)
    .pipe(plumber())
    .pipe(sass({outputStyle:'compressed'}))
    .pipe(gulp.dest(dest))
    .pipe(livereload());
    cb();
  })


})
function css(cb){
   gulp.series(...cssTasks.values());
   cb();
}


// -------------js编译---------------
let jsTasks = new Map();
let jsFiles = glob.sync(__dirname+'/src/js/+(admin|blog)/*.js');
jsFiles.forEach(jsFile =>{
  let dest = path.dirname(jsFile.replace('src','public'));
  jsTasks.set(jsFile,function(cb){
    gulp.src(jsFile)
    .pipe(plumber())
    .pipe(named())
    .pipe(webpack({
      mode: 'development',
      watch: true,
      module: {
        rules: [{
          test: /\.js$/,
          exclude: path.resolve(__dirname, 'node_modules/'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              compact: false,
              plugins: ["@babel/plugin-transform-runtime"]
            }
          }
        }]
      }
    }, compiler))
    .pipe(uglify())
    .pipe(gulp.dest(dest))
    .pipe(livereload());
    cb();
  })
});
function js(cb){
  gulp.series(...jsTasks.values());
  cb();
}
// -------------图片编译-----------
function img(cb){
  gulp.src('./src/img/*.*')
    .pipe(gulp.dest('./public/img/'))
    .pipe(livereload())
    cb();
}
function watch(cb){
  for(let [key,value] of cssTasks.entries()){
    gulp.watch(key,gulp.parallel(value));
  }
 
  for(let [key,value] of jsTasks.entries()){
    gulp.watch(key,gulp.parallel(value));
  }

  gulp.watch('./src/img/*.*',gulp.parallel(img));
  cb();
}

function develop(cb){
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee pug',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', (chunk) => {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
  cb();
}

exports.default=gulp.series(css,js,img,develop,watch);