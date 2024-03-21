const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  short_desc: { type: String, required: true },
  long_desc: { type: String, required: true },
  imgs: [{ type: String, required: true }],
  price: { type: Number, required: true },
  type: { type: String, required: true },
  //số lượng còn lại trong kho
  stock: { type: Number, required: true },
  //trạng thái xóa của sản phẩm
  isDeleted: { type: Boolean, required: false },
});
module.exports = mongoose.model("products", productSchema);
