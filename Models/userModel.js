const mongoose = require("mongoose");
const validator = require("validator");
const bycryt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name."],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: [true, "The email is already being used"],
    validate: validator.isEmail,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: 8,
    maxlength: 12,
    select: false,
  },

  confirmPassword: {
    type: String,
    required: [true, "Please confirm password"],
    validate: {
      validator: function (value) {
        return this.password == value;
      },
      message: "Password and confirm password didn't match",
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },

  passwordResetTokenExpiresAt: {
    type: Date,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bycryt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.confirmUserPassword = async function (psw, pswDB) {
  return await bycryt.compare(psw, pswDB);
};

userSchema.methods.compareTimeStamps = async function (pswTs, tokenTs) {
  const pswTsMilscs = parseInt(pswTs.getTime() / 1000, 10);
  return pswTsMilscs < tokenTs;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  (this.passwordChangedAt = Date.now()),
    (this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const user = mongoose.model("user", userSchema);

module.exports = user;
