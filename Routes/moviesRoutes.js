const express = require("express");
const moviesController = require("./../Controllers/moviesController");
const authController = require("./../Controllers/authController");

//FIRST WAY

// app.get("/api/v1/movies", getAllMovie);

// app.get("/api/v1/movies/:id", getMovieById);

// app.post("/api/v1/movies", addMovie);

// app.patch("/api/v1/movies/:id", updateMovie);

// app.delete("/api/v1/movies/:id", deleteMovie);

//SECOND WAY

// app.route("/api/v1/movies").get(getAllMovie).post(addMovie);

// app
//   .route("/api/v1/movies/:id")
//   .get(getMovieById)
//   .patch(updateMovie)
//   .delete(deleteMovie);

//THIRD WAY
const router = express.Router();
//Middleware function
// router.param("id", moviesController.validExistance);

router.route("/stats").get(moviesController.getMovieStats);

router.route("/genres/:genre").get(moviesController.getMovieByGenre);

router
  .route("/five-top-rated-movies")
  //getTopFiveRatedMovies - middleware function
  .get(moviesController.topFiveRatedMovies, moviesController.getAllMovie);

router
  .route("/:id")
  .get(authController.protect, moviesController.getMovieById)
  .patch(
    authController.protect,
    authController.restrict("admin", "test1"), //multiple permission
    moviesController.updateMovie
  )
  .delete(
    authController.protect,
    authController.restrict("admin", "test1"),
    moviesController.deleteMovie
  );

router
  .route("/")
  .get(authController.protect, moviesController.getAllMovie)
  .post(moviesController.addMovie);

module.exports = router;
