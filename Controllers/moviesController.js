const Movie = require("./../Models/movieModel");
const ApiFeatures = require("../Utils/ApiFeatures");

//Query Alaising route
exports.topFiveRatedMovies = (req, resp, next) => {
  (req.query.limit = "5"), (req.query.sort = "-ratings");
  next();
};

function positiveResponse(req, resp, movieObj, respCode) {
  if (movieObj != null && movieObj.length == 1) {
    resp.status(respCode).json({
      date: req.date,
      status: "succesful",
      data: {
        movie: movieObj,
      },
    });
  }

  if (movieObj != null && movieObj.length > 1) {
    resp.status(respCode).json({
      date: req.date,
      status: "succesful",
      count: movieObj.length,
      data: {
        movies: movieObj,
      },
    });
  }
}

function errorResponse(req, resp, error, respCode) {
  resp.status(respCode).json({
    date: req.date,
    status: "fail",
    message: error.message,
  });
}

exports.getAllMovie = async (req, resp) => {
  try {
    const count = await Movie.countDocuments();

    const apiFeatures = new ApiFeatures(Movie.find(), req.query, count)
      .sortUrl()
      .sortResultSet()
      .limitByFileds()
      .paginate();

    const movies = await apiFeatures.query;

    if (movies == null || movies.length < 1) {
      throw new Error("No movie found!!!");
    }

    positiveResponse(req, resp, movies, 200);
  } catch (error) {
    errorResponse(req, resp, error, 404);
  }
};

exports.getMovieById = async (req, resp) => {
  try {
    const movie = await Movie.findById(req.params.id);
    positiveResponse(req, resp, movie, 200);
  } catch (error) {
    message = { message: "Movie with ID: " + req.params.id + " is not found!" };
    errorResponse(req, resp, message, 404);
  }
};

exports.addMovie = async (req, resp) => {
  try {
    const movie = await Movie.create(req.body);
    positiveResponse(req, resp, movie, 201);
  } catch (error) {
    errorResponse(req, resp, error, 400);
  }
};

exports.updateMovie = async (req, resp) => {
  try {
    const updateMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    positiveResponse(req, resp, updateMovie, 200);
  } catch (error) {
    errorResponse(req, resp, error, 404);
  }
};

exports.deleteMovie = async (req, resp) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    resp.status(204).json({
      status: "successful",
      data: null,
    });
  } catch (error) {
    message = {
      message: "Movie with ID: " + req.params.id + " is not found!",
    };
    errorResponse(req, resp, message, 404);
  }
};
