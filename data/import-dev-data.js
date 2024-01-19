const mongoose = require("mongoose");
const fs = require("fs");
const Movie = require("./../Models/movieModel");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.CONN_STR)
  .then(() => {
    console.log("Db connection successful");
  })
  .catch((error) => {
    console.log("DB connection error: " + error);
  });

const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));

const deleteMovie = async () => {
  try {
    await Movie.deleteMany();
    console.log("Movie deleted successfully...");
  } catch (error) {
    console.log("Error: " + error.message);
  }
  process.exit(1);
};

const importMovie = async () => {
  try {
    await Movie.create(movies);
    console.log("Movie imported successfully...");
  } catch (error) {
    console.log("Error: " + error.message);
  }
  process.exit(1);
};

if (process.argv[2] == "--delete") {
  deleteMovie();
}

if (process.argv[2] == "--import") {
  importMovie();
}
