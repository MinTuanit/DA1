const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    seat_count: {
      type: Number,
      required: true
    },
    cinema_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinemas',
      required: true
    },
  }
);

const Room = mongoose.model("Rooms", RoomSchema);

module.exports = Room;