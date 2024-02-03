const asyncErrorHandler = require("./../Utils/AsyncErrorHandler");
const User = require("./../Models/userModel");
const jwt = require("jsonwebtoken");
const customError = require("./../Utils/CustomError");
const CustomError = require("./../Utils/CustomError");
const localDate = require("./../Utils/locatDate");
const authController = require("./authController");

const filterFileds = (newObj, ...allowedFields) => {
  permittedFileds = {};
  Object.keys(newObj).forEach((field) => {
    if (allowedFields.includes(field)) {
      permittedFileds[field] = newObj[field];
    }
  });
  return permittedFileds;
};

exports.getAllUsers = asyncErrorHandler(async (req, resp) => {
  const users = await User.find();
  resp.status(200).json({
    status: "success",
    count: users.length,
    data: {
      users,
    },
  });
});

exports.updatePassword = asyncErrorHandler(async (req, resp, next) => {
  //CHECK USER EXIST IN THE DB
  const user = await User.findById(req.user._id).select("+password");
  //VERIFY THE CURRENT PASSWORD IS CORRECT
  const currentPassword = req.body.currentPassword;
  console.log(user);
  if (
    !user ||
    !(await user.confirmUserPassword(currentPassword, user.password))
  ) {
    return next(
      new CustomError("The current password you provided is wrong", 400)
    );
  }
  //UPDATE PASSWORD IF THE CURRENT PASSWORD IS CORRECT
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordChangedAt = localDate.date();
  await user.save();

  const ur = await User.findById(user._id);

  //LOGIN USER SEND JWT
  authController.response(ur, 200, resp);
});

exports.updateMe = asyncErrorHandler(async (req, resp, next) => {
  if (req.body.passwor || req.body.confirmPassword) {
    return next(
      new customError("Password can not be updated using this end point", 400)
    );
  }

  const allowedFields = await filterFileds(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedFields,
    {
      runValidators: true,
      new: true,
    }
  );
  resp.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = asyncErrorHandler(async (req, resp, next) => {
  await User.findOneAndUpdate(req.user._id, { active: false });
  resp.status(204).json({
    status: "success",
    data: null,
  });
});
