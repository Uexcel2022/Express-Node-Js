//Import express
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());
const movies = JSON.parse(fs.readFileSync("./data/movies.json"));

let movieObject;

function checkMovie(resp, id) {
  let movie = movies.find((el) => el.id == id);
  if (!movie) {
    return resp.status(404).json({
      status: "failed",
      massage: "Movie with ID " + id + " was not found",
    });
  }

  movieObject = movie;
}

function writeUpdate(resp, movies) {
  fs.writeFile("./data/movies.json", JSON.stringify(movies), (error) => {
    if (error) {
      return resp.status(500).json({
        status: "failed",
      });
    }
  });
}

const getAllMovie = (req, resp) => {
  resp.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies: movies,
    },
  });
};

const getMovieById = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(resp, id);
  resp.status(200).json({
    status: "success",
    data: {
      movie: movieObject,
    },
  });
};

const addMovie = (req, resp) => {
  let newId = { id: movies[movies.length - 1].id + 1 };
  let newMovie = Object.assign(newId, req.body);
  movies.push(newMovie);
  writeUpdate(resp, movies);
  resp.status(201).json({
    status: "success",
    data: {
      movie: newMovie,
    },
  });
};

const updateMovie = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(resp, id);
  let movieIndex = movies.indexOf(movieObject);
  Object.assign(movieObject, req.body);
  movies[movieIndex] = movieObject;
  writeUpdate(resp, movies);
  resp.status(200).json({
    status: "success",
    data: {
      movie: movieObject,
    },
  });
};

const deleteMovie = (req, resp) => {
  let id = req.params.id * 1;
  checkMovie(resp, id);
  let movieIndex = movies.indexOf(movieObject);
  movies.splice(movieIndex, 1);
  writeUpdate(resp, movies);
  resp.status(204).json({
    satus: "success",
    data: {
      movie: null,
    },
  });
};

// app.get("/api/v1/movies", getAllMovie);

// app.get("/api/v1/movies/:id", getMovieById);

// app.post("/api/v1/movies", addMovie);

// app.patch("/api/v1/movies/:id", updateMovie);

// app.delete("/api/v1/movies/:id", deleteMovie);

app.route("/api/v1/movies").get(getAllMovie).post(addMovie);

app
  .route("/api/v1/movies/:id")
  .get(getMovieById)
  .patch(updateMovie)
  .delete(deleteMovie);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
