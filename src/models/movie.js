const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: [String],
      required: true
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    director: {
      type: String,
      required: false,
      trim: true
    },
    actors: {
      type: [String],
      required: false
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true
    },
    release_date: {
      type: Date,
      required: true
    },
    poster_url: {
      type: String,
      required: true,
      trim: true
    },
    trailer_url: {
      type: String,
      required: true,
      trim: true
    }
  }
);

const Movie = mongoose.model("Movies", MovieSchema);

module.exports = Movie;