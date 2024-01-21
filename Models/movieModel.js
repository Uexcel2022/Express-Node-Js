const mongoose = require("mongoose");
const fs = require("fs");

const movieSchema = new mongoose.Schema(
  {
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

//Creating pre middleware
movieSchema.pre("save", function (next) {
  this.createdBy = "uexcel";
  next();
});

movieSchema.post("save", function (doc, next) {
  const content = `A new movie document name: "${doc.name}" ; created by ${doc.createdBy} on ${doc.createdAt}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err);
  });
  next();
});
const Movie = mongoose.model("movie", movieSchema);

module.exports = Movie;
