//Import express
const { error } = require("console");
const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());

const movies = JSON.parse(fs.readFileSync("./data/movies.json"));

//GET REQUEST - /api/v1/movies
app.get("/api/v1/movies", (req, resp) => {
  resp.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies: movies,
    },
  });
});

//GET REQUEST - /api/v1/movies/:id

app.get("/api/v1/movies/:id", (req, resp) => {
  let id = req.params.id * 1;
  let movie = movies.find((el) => el.id == id);
  if (!movie) {
    return resp.status(400).json({
      time: new Date().toLocaleString(),
      status: "Failed",
      massage: "Movie with ID " + id + " not found!",
    });
  }

  resp.status(200).json({
    status: "success",
    data: {
      movie: movie,
    },
  });
});

//POST REQUEST - /api/v1/movies
app.post("/api/v1/movies", (req, resp) => {
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
});

//CREATE SERVER
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
