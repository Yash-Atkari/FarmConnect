const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  price: Number,
  category: String,
  image: String,
  farmerId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("Product", ProductSchema);
