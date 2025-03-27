const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema(
  {
    seat_name: {
      type: String,
      required: true
    },
    seat_column: {
      type: Number,
      required: true
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rooms',
      required: true
    }
  }
);

const Seat = mongoose.model("Seats", SeatSchema);

module.exports = Seat;