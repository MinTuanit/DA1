const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    total_price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: [
        'pending',
        'completed',
        'cancelled'
      ],
      default: 'pending'
    },
    ordered_at: {
      type: Date,
      default: Date.now
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
  }
);

const Order = mongoose.model("Orders", OrderSchema);

module.exports = Order;