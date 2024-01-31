process.on("uncaughtException", (err) => {
  console.log(err.name, " " + err.message);
  console.log("Uncought exception occurred. Shutting down...");
  process.exit(1);
});

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.CONN_STR)
  .then((conn) => {
    console.log("DB connection is successful...");
  })
  .catch(() => {
    console.log("DB connection failed...");
    console.log("rejected promise occurred. Shutting down...");
    server.close(() => {
      process.exit(1);
    });
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Server listing on port " + port);
  console.log(process.env.NODE_ENV);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, " " + err.message);
  console.log("Unhandled rejection occurred. Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
