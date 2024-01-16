const fs = require("fs");
const movies = JSON.parse(fs.readFileSync("./data/movies.json"));
let movieObject;
let writeError;

function checkMovie(req, resp, id) {
  let movie = movies.find((el) => el.id == id);
  if (!movie) {
    movieObject = 0;
    return resp.status(404).json({
      date: req.date,
      status: "failed",
      massage: "Movie with ID " + id + " was not found",
    });
  }

  movieObject = movie;
}

function writeUpdate(req, resp, movies) {
  fs.writeFile("./data/movies.json", JSON.stringify(movies), (error) => {
    if (error) {
      writeError = 1;
      return resp.status(500).json({
        date: req.date,
        status: "failed",
        massage: "something went wrong!!!!",
      });
    }
  });
}

exports.getAllMovie = (req, resp) => {
  resp.status(200).json({
    date: req.date,
    status: "success",
    count: movies.length,
    data: {
      movies: movies,
    },
  });
};

exports.getMovieById = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(req, resp, id);
  if (movieObject != 0) {
    resp.status(200).json({
      date: req.date,
      status: "success",
      data: {
        movie: movieObject,
      },
    });
  }
};

exports.addMovie = (req, resp) => {
  let newId = { id: movies[movies.length - 1].id + 1 };
  let newMovie = Object.assign(newId, req.body);
  movies.push(newMovie);
  writeUpdate(req, resp, movies);
  if (writeError != 1) {
    resp.status(201).json({
      date: req.date,
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  }
};

exports.updateMovie = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(req, resp, id);
  if (movieObject != 0) {
    let movieIndex = movies.indexOf(movieObject);
    Object.assign(movieObject, req.body);
    movies[movieIndex] = movieObject;
    writeUpdate(req, resp, movies);
    if (writeError != 1) {
      resp.status(200).json({
        date: req.date,
        status: "success",
        data: {
          movie: movieObject,
        },
      });
    }
  }
};

exports.deleteMovie = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(req, resp, id);
  if (movieObject != 0) {
    let movieIndex = movies.indexOf(movieObject);
    movies.splice(movieIndex, 1);
    writeUpdate(req, resp, movies);
    if (writeError != 1) {
      resp.status(204).json({
        satus: "success",
        data: {
          movie: null,
        },
      });
    }
  }
};
