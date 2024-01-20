const Movie = require("./../Models/movieModel");

function positiveResponse(req, resp, movieObj, respCode) {
  if (movieObj.length == 1) {
    resp.status(respCode).json({
      date: req.date,
      status: "succesful",
      data: {
        movie: movieObj,
      },
    });
  }

  if (movieObj.length > 1) {
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
    //REMOVING QUERY STRINGS THAT ARE FIELDS

    let exclusion = ["sort", "page", "limit", "fields"];
    let stringQuery = { ...req.query };
    exclusion.forEach((el) => {
      delete stringQuery[el];
    });

    // let stringQuery = req.query;

    //ADDING $ TO <= >= <>  TO MEET MONGOOSE SPECIFICATION

    let strQuery = JSON.stringify(stringQuery);

    const stringQueryObj = JSON.parse(
      strQuery.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    let query = Movie.find(stringQueryObj);

    //SORTING LOGIC
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //FIELDS FIELDS LOGIC
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); //to exclude __v default mongodb fieldcls
    }

    //PAGING

    if (req.query.page) {
      let page = req.query.page * 1 || 1;
      let limit = req.query.limit * 1 || 10;

      const count = await Movie.countDocuments();
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);

      if (skip >= count) {
        throw new Error("This page is not found");
      }
    }

    const movies = await query;

    if (movies.length < 1) {
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
