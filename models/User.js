const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  pass: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: false },
  role: { type: String, required: true, default: "client" },
});
module.exports = mongoose.model("users", UserSchema);
