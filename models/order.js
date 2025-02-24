const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  buyerId: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
});

module.exports = mongoose.model("Order", OrderSchema);
