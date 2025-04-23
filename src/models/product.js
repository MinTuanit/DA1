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
    category: {
      type: String,
      enum: [
        'Food',
        'Other',
        'Combo',
        'Drink',
        'Souvenir'
      ],
      default: 'Other'
    },
  }
);

const Product = mongoose.model("Products", productSchema);

module.exports = Product;