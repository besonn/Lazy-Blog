// 作者
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const AuthorSchema = new Schema({
  username: String, // 用户名
  nickname: String, // 昵称
  password: String, // 密码
  email: String, // 邮箱
  intro: String, // 个人简介
  portrait: String, // 头像
  registerTime: {type: Date, default: Date.now} // 注册时间
}, {collection: 'author'});

AuthorSchema.plugin(passportLocalMongoose, {
  usernameUnique: true,
  hashField: 'password'
});

module.exports = mongoose.model('Author', AuthorSchema);
