const express = require("express");
const moviesController = require("./Controllers/moviesController");

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
router.param("id", moviesController.validExistance);

router
  .route("/:id")
  .get(moviesController.getMovieById)
  .patch(moviesController.updateMovie)
  .delete(moviesController.deleteMovie);

router
  .route("/")
  .get(moviesController.getAllMovie)
  .post(moviesController.validateRequestBody, moviesController.addMovie);

module.exports = router;
