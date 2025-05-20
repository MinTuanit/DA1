const mongoose = require("mongoose");

const ConstraintSchema = new mongoose.Schema(
    {
        min_price: {
            type: Number,
            required: true
        },
        max_price: {
            type: Number,
            required: true
        },
        time_skip: {
            type: Number, // số phút giữa 2 suất chiếu để dọn dẹp
            required: true
        },
        max_order_seat: {
            type: Number,
            required: true
        },
        reservation_time: {
            type: Number, // số phút giữ vé
            required: true
        },
    }
);

const Constraint = mongoose.model("Constraints", ConstraintSchema);

module.exports = Constraint;