const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'reserved',
        'paid',
        'cancelled'
      ],
      default: 'reserved'
    },
    booked_at: {
      type: Date,
      default: Date.now
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orders',
      required: true
    },
    showtime_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtimes',
      required: true
    },
    seat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seats',
      required: true
    },
  }
);

const Ticket = mongoose.model("Tickets", TicketSchema);

module.exports = Ticket;