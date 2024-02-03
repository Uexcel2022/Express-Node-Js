const asyncErrorHandler = require("./../Utils/AsyncErrorHandler");
const User = require("./../Models/userModel");
const jwt = require("jsonwebtoken");
const customError = require("./../Utils/CustomError");
const util = require("util");
const sendMail = require("./../Utils/email");
const CustomError = require("./../Utils/CustomError");
const crypto = require("crypto");
const localDate = require("./../Utils/locatDate");

//create token
const webtoken = (id) => {
  return jwt.sign(
    { id, iat: parseInt(localDate.date().getTime() / 1000, 10) },
    process.env.SECRET_STR,
    {
      expiresIn: process.env.TOKEN_EXPIRES,
    }
  );
};

const response = (user, statusCode, resp) => {
  const token = webtoken(user._id);
  resp.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const sentToken = (user, statusCode, resp) => {
  const token = webtoken(user._id);
  resp.status(200).json({
    status: "success",
    token,
  });
};

exports.signup = asyncErrorHandler(async (req, resp) => {
  const newUser = await User.create(req.body);
  response(newUser, 201, resp);
});

exports.login = asyncErrorHandler(async (req, resp, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new customError(
      "Please enter your email and password to login",
      400
    );
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.confirmUserPassword(password, user.password))) {
    const err = new customError("Incorrect email or password", 400);
    return next(err);
  }
  sentToken(user, 200, resp);
});

exports.protect = asyncErrorHandler(async (req, resp, next) => {
  let token;
  if (!req.headers.authorization) {
    return next(new customError("You are not logged in", 401));
  }
  if (req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new customError("You are not logged in", 401));
  }

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  const user = await User.findById(decodedToken.id).select(
    "+passwordChangedAt"
  );

  if (!user) {
    return next(new customError("The user no longer exist", 401));
  }

  if (
    user.passwordChangedAt &&
    !(await user.compareTimeStamps(user.passwordChangedAt, decodedToken.iat))
  ) {
    return next(
      new customError(
        "The password was changed recently. Please login again!",
        401
      )
    );
  }
  req.user = user;
  next();
});

//For single roles
// exports.restrict = (role) => {
//   return (req, resp, next) => {
//     if (req.user.role !== role) {
//       next(
//         new customError(
//           "You do not have permission to perform this action",
//           403
//         )
//       );
//     }
//     next();
//   };
// };

//for multiple roles
exports.restrict = (...roles) => {
  return (req, resp, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new customError(
          "You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};

exports.sendPasswordResetToken = asyncErrorHandler(async (req, resp, next) => {
  //SEARCH FOR USER WITH EMAIL
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new customError("User not found", 404));
  }
  //GENERATE PASSWORDRESET TOKEN USING INSTANT FUNCTION
  const passwordResetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //CREATING RESET PASSWORD LINK AND MESSAGE TO THE USER
  const restUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/vi/users/resetPassord/${passwordResetToken}`;

  const message = `We have received your password reset request. Please use the link below to reset your password\n\n${restUrl}\n\n This link will expire in 10 minutes time `;

  //SEND RESET PASSWORD LINK AND FEEDBACK
  try {
    await sendMail({
      email: user.email,
      subject: "Password Reset",
      message: message,
    });
    resp.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordChangedAt = undefined;
    user.save({ validateBeforeSave: false });

    next(
      new customError(
        "We encoutered error while sending password reset email. Please try again later",
        500
      )
    );
  }
});

exports.resetPassord = asyncErrorHandler(async (req, resp, next) => {
  const inComingToken = req.params.token.trim();

  //ENCRIPT RESETTOKEN
  const token = crypto.createHash("sha256").update(inComingToken).digest("hex");

  //CHECK IF THERE IS USER WITH THE RESERT TOKEN
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpiresAt: { $gt: localDate.date() },
  });

  if (!user) {
    return next(new CustomError("The token is invalid or has expired", 400));
  }

  //RESET PASSWORD
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  user.passwordChangedAt = localDate.date();
  await user.save();

  //SEND RESPONSE
  sentToken(user, 200, resp);
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
  response(ur, 200, resp);
});
