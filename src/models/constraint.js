const mongoose = require("mongoose");

const ConstraintSchema = new mongoose.Schema(
    {
        min_ticket_price: {
            type: Number,
            required: true
        },
        max_ticket_price: {
            type: Number,
            required: true
        },
        min_product_price: {
            type: Number,
            required: true
        },
        max_product_price: {
            type: Number,
            required: true
        },
        open_time: {
            type: String,
            required: true
        },  
        close_time: {
            type: String,
            required: true
        },
        time_gap: {
            type: Number,
            required: true
        },
        employee_min_age: {
            type: Number,
            required: true
        },
        employee_max_age: {
            type: Number,
            required: true
        },
        reservation_time: {
            type: Number,
            required: true
        },
    }
);

const Constraint = mongoose.model("Constraints", ConstraintSchema);

module.exports = Constraint;