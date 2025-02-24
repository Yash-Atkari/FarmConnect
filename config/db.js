const mongoose = require("mongoose");

const mongoUrl = "mongodb://127.0.0.1:27017/farmconnect"; // Move to .env

const connectDB = async () => {
  await mongoose.connect(mongoUrl);
};

module.exports = connectDB;
