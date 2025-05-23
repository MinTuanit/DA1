const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orders',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    payment_method: {
      type: String,
      enum: [
        'momo',
        'banking',
        'visa/mastercard',
        'cash'
      ],
      required: true
    },
    paid_at: {
      type: Date,
      default: Date.now
    },
    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discounts'
    }
  }
);

const Payment = mongoose.model("Payments", PaymentSchema);

module.exports = Payment;