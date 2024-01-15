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
