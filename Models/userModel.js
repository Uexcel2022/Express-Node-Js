const mongoose = require("mongoose");
const validator = require("validator");
const bycryt = require("bcryptjs");

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

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: 8,
    maxlength: 12,
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
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bycryt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

const user = mongoose.model("user", userSchema);

module.exports = user;
