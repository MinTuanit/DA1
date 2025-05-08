const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movies',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: false,
      trim: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }
);

const Review = mongoose.model("Reviews", ReviewSchema);

module.exports = Review;