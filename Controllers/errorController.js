const customError = require("./../Utils/CustomError");

const devErrors = (resp, error) => {
  resp.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stactTrace: error.stact,
    error: error,
  });
};

const prodErrors = (resp, error) => {
  if (error.isOperational) {
    resp.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    resp.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later!",
    });
  }
};

const handleDuplicateMovieName = (error) => {
  const msg = `There is already a movie with the name: ${error.keyValue.name}. Please choose another name.`;
  return new customError(msg, 400);
};

const castErrorHandler = (error) => {
  const msg = `Invalid value: ${error.value} for ${error.path}`;
  return new customError(msg, 400);
};

const validatorErrorHandler = (error) => {
  const err = Object.values(error.errors).map((val) => val.message);
  const msg = ` Invalid input data:  ${err.join(". ")}`;
  return new customError(msg, 400);
};

const jsonWebTokenErrorHandler = () => {
  return new customError("Invalid jwt, please login again", 401);
};

const tokenExpiredErrorHandler = () => {
  return new customError("Jwt has expired, please login again", 401);
};

module.exports = (error, req, resp, next) => {
  (error.statusCode = error.statusCode || 500),
    (error.status = error.status || "error");
  if (process.env.NODE_ENV === "development") {
    devErrors(resp, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") {
      error = castErrorHandler(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateMovieName(error);
    }

    if (error.name == "ValidatorError") {
      error = validatorErrorHandler(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = jsonWebTokenErrorHandler();
    }

    if (error.name === "TokenExpiredError") {
      error = tokenExpiredErrorHandler();
    }

    prodErrors(resp, error);
  }
};
