const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.CONN_STR)
  .then((conn) => {
    // console.log(conn);
    console.log("DB connection is successful...");
  })
  .catch((error) => {
    console.log("DB connection error occoured");
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listing on port " + port);
});
