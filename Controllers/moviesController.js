const Movie = require("./../Models/movieModel");
const ApiFeatures = require("../Utils/ApiFeatures");
const asyncErrorHandler = require("./../Utils/AsyncErrorHandler");
const CustomError = require("./../Utils/CustomError");

//Query Alaising route
exports.topFiveRatedMovies = (req, resp, next) => {
  (req.query.limit = "5"), (req.query.sort = "-ratings");
  next();
};

function requestResponse(req, resp, movie, next) {
  if (JSON.stringify(movie) == "[]" || !movie) {
    const customError = new CustomError("Not Found", 404);
    return next(customError);
  }

  if (movie != null && !movie.length) {
    resp.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  }

  if (movie != null && movie.length) {
    resp.status(200).json({
      status: "succes",
      data: {
        movies: movie,
      },
    });
  }
}

exports.getAllMovie = asyncErrorHandler(async (req, resp, next) => {
  const count = await Movie.countDocuments();
  const apiFeatures = new ApiFeatures(Movie.find(), req.query, count)
    .sortUrl()
    .sortResultSet()
    .limitByFileds()
    .paginate();

  const movies = await apiFeatures.query;
  requestResponse(req, resp, movies, next);
  // resp.status(200).json({
  //   date: req.date,
  //   status: "succesful",
  //   count: movies.length,
  //   data: {
  //     movies,
  //   },
  // });
});

exports.getMovieById = asyncErrorHandler(async (req, resp, next) => {
  const movie = await Movie.findById(req.params.id); //.select("-__v");
  requestResponse(req, resp, movie, next);
  // resp.status(200).json({
  //   date: req.date,
  //   status: "succesful",
  //   data: {
  //     movie,
  //   },
  // });
});

exports.addMovie = asyncErrorHandler(async (req, resp, next) => {
  let movie = await Movie.create(req.body);
  movie = await Movie.findOne(movie._id); //.select("-__v");
  requestResponse(req, resp, movie, next);
  // resp.status(201).json({
  //   date: req.date,
  //   status: "succesful",
  //   data: {
  //     movie,
  //   },
  // });
});

exports.updateMovie = asyncErrorHandler(async (req, resp, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  requestResponse(req, resp, movie, next);
  // resp.status(200).json({
  //   date: req.date,
  //   status: "succesful",
  //   data: {
  //     movie,
  //   },
  // });
});

exports.deleteMovie = asyncErrorHandler(async (req, resp, next) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
  if (!deletedMovie) {
    return requestResponse(req, resp, deletedMovie, next);
  }
  resp.status(204).json({
    status: "successful",
    data: null,
  });
});

exports.getMovieStats = asyncErrorHandler(async (req, resp, next) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 6 } } },
    {
      $group: {
        _id: "$releasedYear",
        avgRatings: { $avg: "$ratings" },
        minRatings: { $min: "$ratings" },
        maxRating: { $max: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totalPrice: { $sum: "$price" },
        moviesCount: { $sum: 1 },
      },
    },
    { $sort: { avgRatings: -1 } }, //1 asc,-1 desc
    { $match: { avgRatings: { $gte: 8 } } },
  ]);
  requestResponse(req, resp, stats, next);
  // resp.status(200).json({
  //   date: req.date,
  //   status: "succesful",
  //   count: stats.length,
  //   data: {
  //     movie: stats,
  //   },
  // });
});

exports.getMovieByGenre = asyncErrorHandler(async (req, resp, next) => {
  const reqGenre = req.params.genre;

  // try {
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { gengre: "$_id" } }, //add field and asign the value of another field
    { $project: { _id: 0 } }, // use to remove a field from the result set
    { $sort: { movieCount: -1 } },
    { $limit: 5 }, // to limit result
    { $match: { gengre: reqGenre } },
  ]);
  requestResponse(req, resp, movies, next);
  // resp.status(200).json({
  //   date: req.date,
  //   status: "succesful",
  //   count: movies.length,
  //   data: {
  //     movies,
  //   },
  // });
});
