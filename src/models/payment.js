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
        'credit_card',
        'paypal',
        'cash'
      ],
      required: true
    },
    status: {
      type: String,
      enum: [
        'pending',
        'completed',
        'failed'
      ],
      default: 'pending'
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