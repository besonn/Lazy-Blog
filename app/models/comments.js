// 评论
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
  text: String, // 评论的内容
  createTime: {type: Date, default: Date.now}, // 评论的时间
  poster: {type: Schema.Types.ObjectId, ref: 'Author'}, // 评论者
  posts: {type: Schema.Types.ObjectId, ref: 'Article'} // 评论哪篇文章
}, {collection: 'comments'});

mongoose.model('Comments', CommentsSchema);
