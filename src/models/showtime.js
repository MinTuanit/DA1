const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema(
  {
    showtime: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movies',
      required: true
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rooms',
      required: true
    }
  }
);

const Showtime = mongoose.model("Showtimes", ShowtimeSchema);

module.exports = Showtime;