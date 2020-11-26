// 分类
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: String, // 分类的名称
  createTime: {type: Date, default: Date.now}, // 创建时间
  author: {type: Schema.Types.ObjectId, ref: 'Author'}
}, {collection: 'category'});

mongoose.model('Category', CategorySchema);
