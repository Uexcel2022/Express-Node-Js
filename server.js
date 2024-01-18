const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log(conn);
    console.log("connection to db is successful...");
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listing on port " + port);
  // console.log(app.get("env"));
  console.log(process.env);
});
