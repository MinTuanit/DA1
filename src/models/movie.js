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
    age_limit: {
      type: Number
    },
    trailer_url: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: [
        'Stopped',
        'Unknown',
        'Now Playing',
        'Coming Soon'
      ],
      default: 'Unknown'
    },
  }
);

const Movie = mongoose.model("Movies", MovieSchema);

module.exports = Movie;