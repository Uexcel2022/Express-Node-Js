const Movie = require("./../Models/movieModel");
let movieObject;
let writeError;

exports.validExistance = (req, resp, next, value) => {
  if (!movieObject) {
    return resp.status(404).json({
      date: req.date,
      status: "failed",
      massage: "Movie with ID " + value + " was not found",
    });
  }
  next();
};

exports.getAllMovie = (req, resp) => {
  resp.status(200).json({
    date: req.date,
    status: "success",

    data: {},
  });
};

exports.getMovieById = (req, resp) => {
  resp.status(200).json({
    date: req.date,
    status: "success",
    data: {},
  });
};

exports.addMovie = async (req, resp) => {
  try {
    const movie = await Movie.create(req.body);
    resp.status(201).json({
      date: req.date,
      status: "succesful",
      data: {
        movie,
      },
    });
  } catch (error) {
    resp.status(400).json({
      date: req.date,
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateMovie = (req, resp) => {
  writeUpdate(req, resp, movies);
  if (writeError != 1) {
    resp.status(200).json({
      date: req.date,
      status: "success",
      data: {},
    });
  }
};

exports.deleteMovie = (req, resp) => {
  writeUpdate(req, resp, movies);
  if (writeError != 1) {
    resp.status(204).json({
      satus: "success",
      data: {
        movie: null,
      },
    });
  }
};
