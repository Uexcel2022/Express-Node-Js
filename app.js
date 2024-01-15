//Import express
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());

const movies = JSON.parse(fs.readFileSync("./data/movies.json"));

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
  let movie = movies.find((el) => el.id == id);
  if (!movie) {
    return resp.status(400).json({
      status: "failed",
      massage: "Movie with ID " + id + " was not found.",
    });
  }

  resp.status(200).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
};

const addMovie = (req, resp) => {
  let newId = { id: movies[movies.length - 1].id + 1 };
  let newMovie = Object.assign(newId, req.body);
  movies.push(newMovie);
  fs.writeFile("./data/movies.json", JSON.stringify(movies), (error) => {
    if (error) {
      resp.status(500).json({
        status: "failed",
      });
    } else {
      resp.status(201).json({
        status: "success",
        data: {
          movie: newMovie,
        },
      });
    }
  });
};

//GET REQUEST - /api/v1/movies
app.get("/api/v1/movies", getAllMovie);

//GET REQUEST - /api/v1/movies/:id

app.get("/api/v1/movies/:id", getMovieById);

//POST REQUEST - /api/v1/movies
app.post("/api/v1/movies", addMovie);

//PATCH REQUEST - /api/v1/movies/:id
app.patch("/api/v1/movies/:id", (req, resp) => {
  let id = req.params.id * 1;
  let movie = movies.find((el) => el.id == id);
  if (!movie) {
    return resp.status(400).json({
      status: "failed",
      message: "Movie with ID " + id + " was not found.",
    });
  }
  let movieIndex = movies.indexOf(movie);
  updatedMovie = Object.assign(movie, req.body);
  movies[movieIndex] = updatedMovie;
  fs.writeFile("./data/movies.json", JSON.stringify(movies), (error) => {
    if (error) {
      return resp.status(500).json({
        status: "failed",
      });
    }
  });

  resp.status(200).json({
    satus: "success",
    data: {
      movie: updatedMovie,
    },
  });
});

//DELETE REQUEST - /api/v1/movies/:id
app.delete("/api/v1/movies/:id", (req, resp) => {
  let id = req.params.id * 1;
  let movie = movies.find((el) => el.id == id);

  if (!movie) {
    return resp.status(400).json({
      satus: "failed",
      message: "Movie with ID " + id + " was not found.",
    });
  }

  let movieIndex = movies.indexOf(movie);

  movies.splice(movieIndex, 1);

  fs.writeFile("./data/movies.json", JSON.stringify(movies), (error) => {
    if (error) {
      return resp.status(500).json({
        status: "failed",
      });
    }
  });

  resp.status(204).json({
    satus: "success",
    data: {
      movie: null,
    },
  });
});

//CREATE SERVER
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
