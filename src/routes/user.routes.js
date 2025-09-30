const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  updateUserAccountDetails,
  getCurrentUser,
} = require("../controllers/user.controller.js");
const { verifyToken } = require("../middlewares/auth.middleware.js");
const { uploads } = require("../middlewares/multer.js");

const userRouter = express.Router();

userRouter.route("/register").post(
  uploads.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyToken, logoutUser);
userRouter.route("/changePassword").post(verifyToken, changePassword);
userRouter.route("/updateUser").patch(verifyToken, updateUserAccountDetails);
userRouter.route("/").get(verifyToken, getCurrentUser);

module.exports = { userRouter };
