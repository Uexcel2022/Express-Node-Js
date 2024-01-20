const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required field!"],
    unique: true,
    trim: true,
  },

  description: {
    type: String,
    required: [true, "Description is required field!"],
    trim: true,
  },

  description: String,

  duration: {
    type: Number,
    required: [true, "Duration is required field!"],
  },
  ratings: {
    type: Number,
  },
  totalRating: {
    type: Number,
  },
  releasedYear: {
    type: Number,
    required: [true, "Released year is required field!"],
  },
  releasedDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },

  genres: {
    type: [String],
    required: [true, "Genres is required field!"],
  },
  directors: {
    type: [String],
    required: [true, "Directors is required field!"],
  },
  coverImage: {
    type: String,
    required: [true, "Cover image is required field!"],
  },
  actors: {
    type: [String],
    required: [true, "Actors is required field!"],
  },
  price: {
    type: Number,
    required: [true, "Price is required field!"],
    default: 1.0,
  },
});

const Movie = mongoose.model("movie", movieSchema);

module.exports = Movie;
