//Import express
const express = require("express");
const app = express();
const morgan = require("morgan");
const moviesRouter = require("./Routes/moviesRoutes");
const globalErrorHandler = require("./Controllers/errorController");
const ConstomError = require("./Utils/CustomError");
const authRouter = require("./Routes/authRouter");

function dateLog(req, resp, next) {
  req.date = new Date().toLocaleString();
  next();
}

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
console.log(process.env.NODE_ENV);

app.use(express.json());
app.use(dateLog);
app.use(express.static("./public"));

app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/users", authRouter);

//for all request that do not match existing urls
app.all("*", (req, resp, next) => {
  const customError = new ConstomError(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(customError);
});

app.use(globalErrorHandler);

module.exports = app;
