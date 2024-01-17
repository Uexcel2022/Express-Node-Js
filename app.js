//Import express
const express = require("express");
const app = express();
const morgan = require("morgan");
const moviesRouter = require("./Routes/moviesRoutes");

function dateLog(req, resp, next) {
  req.date = new Date().toLocaleString();
  next();
}

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(dateLog);
app.use(express.static("./public"));

app.use("/api/v1/movies", moviesRouter);

module.exports = app;
