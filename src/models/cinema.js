const mongoose = require("mongoose");

const CinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  }
);

const Cinema = mongoose.model("Cinemas", CinemaSchema);

module.exports = Cinema;