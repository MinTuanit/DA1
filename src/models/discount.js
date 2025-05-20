const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    discount_type: {
      type: String,
      enum: [
        'percentage',
        'fixed'
      ],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    max_usage: {
      type: Number,
      required: true
    },
    remaining: {
      type: Number,
      required: true
    },
    min_purchase: {
      type: Number,
      required: true
    },
    expiry_date: {
      type: Date,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }
);

const Discount = mongoose.model("Discounts", DiscountSchema);

module.exports = Discount;