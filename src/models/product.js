const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    catagory: {
      type: String,
      required: true,
      trim: true
    },
  }
);

const Product = mongoose.model("Products", productSchema);

module.exports = Product;