const express = require("express");
const authController = require("./../Controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.sendPasswordResetToken);
router.route("/resetPassword/:token").patch(authController.resetPassord);
router
  .route("/updatePassword")
  .patch(authController.protect, authController.updatePassword);

module.exports = router;
