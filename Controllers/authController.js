const asyncErrorHandler = require("./../Utils/AsyncErrorHandler");
const User = require("./../Models/userModel");
const jwt = require("jsonwebtoken");

exports.signup = asyncErrorHandler(async (req, resp, next) => {
  const newUser = await User.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.SECRET_STR, {
    expiresIn: process.env.TOKEN_EXPIRES,
  });
  resp.status(201).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});
