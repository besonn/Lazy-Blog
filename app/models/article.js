// 文章
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: String, // 标题
  content: String, // 内容
  summary: String, // 摘要
  publishTime: {type: Date, default: Date.now}, // 发表时间
  reading: {type: Number, default: 0}, // 阅读次数
  author: {type: Schema.Types.ObjectId, ref: 'Author'}, // 作者
  category: {type: Schema.Types.ObjectId, ref: 'Category'} // 分类
}, {collection: 'article'});

mongoose.model('Article', ArticleSchema);

