const mongoose = require("mongoose");
const fs = require("fs");
const Validator = require("validator");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required field"],
      unique: true,
      trim: true,
      minlength: [4, "Movie name must have at least 4 characters"],
      maxlength: [100, "Movie name must be 100 characters or below"],
      // validate: [Validator.isAlpha, "Movie name should contain only alphabets"],
    },

    description: {
      type: String,
      required: [true, "Description is required field"],
      trim: true,
    },

    description: String,

    duration: {
      type: Number,
      required: [true, "Duration is required field"],
    },
    ratings: {
      type: Number,
      // min: [1, "Movie ratings must be 1 or above"],
      // max: [10, "Movie rataings must be 10 or below"],

      //custom validator.
      validate: {
        validator: function (value) {
          return value >= 1 && value <= 10;
        },
        message: "Valid minimum rating is 1 and maximum is 10",
      },
    },
    totalRating: {
      type: Number,
    },
    releasedYear: {
      type: Number,
      required: [true, "Released year is required field"],
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
      required: [true, "Genres is required field"],
      enum: {
        values: [
          "Action",
          "Adventure",
          "Sci-Fi",
          "Thriller",
          "Crime",
          "Drama",
          "Comedy",
          "Romance",
          "Biography",
        ],
        message: "This genere does not exist",
      },
    },
    directors: {
      type: [String],
      required: [true, "Directors is required field"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required field"],
    },
    actors: {
      type: [String],
      required: [true, "Actors is required field"],
    },
    price: {
      type: Number,
      required: [true, "Price is required field"],
      default: 1.0,
    },
    createdBy: {
      type: String,
      // select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Creating virtual fields
movieSchema.virtual("durationInhours").get(function () {
  let hrs = this.duration / 60;
  hrs = JSON.stringify(hrs).split(".");
  if (hrs[0] * 1 == 1 && this.duration % 60 == 0) {
    return ` ${hrs[0]} Hr `;
  }
  if (hrs[0] * 1 > 1 && this.duration % 60 == 0) {
    return ` ${hrs[0]} Hrs `;
  }
  if (hrs[0] * 1 == 1 && this.duration % 60 > 0) {
    return ` ${hrs[0]} Hr ${this.duration % 60} Mins `;
  }
  return `${hrs[0]} Hrs ${this.duration % 60} Mins `;
});

//Creating pre middleware - excutes b4 document is saved
//  (You can have many and will executed in the order written)
//inserMany, findAndUpdate will not work.
movieSchema.pre("save", function (next) {
  this.createdBy = "uexcel";
  next();
});

//Creating post middleware excutes after document is saved
// (You can have many and will executed in the order written)
movieSchema.post("save", function (doc, next) {
  const content = `A new movie document name: "${doc.name}" ; created by ${doc.createdBy} on ${doc.createdAt}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err);
  });
  next();
});

// Creating query middleware

movieSchema.pre(/^find/, function (next) {
  //fittering movie with future realease date on find operation
  this.find({ releasedDate: { $lt: Date.now() } }).select("-__v");
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.endTime = Date.now();
  const queryDuration = `The query execution took ${
    this.endTime - this.startTime
  } milliseconds\n`;
  fs.writeFileSync("./Log/log.txt", queryDuration, { flag: "a" }, (err) => {
    console.log(err);
  });
  next();
});

//Creating aggregation middleware

movieSchema.pre("aggregate", function (next) {
  //fittering movie with future realease date on aggregation operation
  this.pipeline().unshift({ $match: { releasedDate: { $lte: new Date() } } });
  next();
});

const Movie = mongoose.model("movie", movieSchema);

module.exports = Movie;
