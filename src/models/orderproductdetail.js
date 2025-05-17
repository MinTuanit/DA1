const mongoose = require("mongoose");

const OrderProductDetailSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orders',
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }
);

const OrderProductDetail = mongoose.model("OrderProductDetails", OrderProductDetailSchema);

module.exports = OrderProductDetail;