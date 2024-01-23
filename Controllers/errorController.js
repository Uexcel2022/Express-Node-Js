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

const castErrorHandler = (error) => {
  const msg = `Invalid value: ${error.value} for ${error.path}`;
  return new customError(msg, 400);
};

module.exports = (error, req, resp, next) => {
  (error.statusCode = error.statusCode || 500),
    (error.status = error.status || "error");

  if (process.env.NODE_ENV == "development") {
    devErrors(resp, error);
  } else if (process.env.NODE_ENV == "production") {
    if (error.name == "CastError") {
      error = castErrorHandler(error);
    }
    prodErrors(resp, error);
  }
};
