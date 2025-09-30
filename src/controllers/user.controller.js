const { default: mongoose } = require("mongoose");
const { User } = require("../models/user.models.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const registerUser = async (req, res) => {
  // console.log("reg.body ", req.body);
  // console.log("req.files ", req.files);
  try {
    const { fullName, email, password, username } = req.body;

    if (
      [fullName, email, password, username].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const isUserExist = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (isUserExist) {
      return res.status(409).json({
        message: "username or email already exist",
      });
    }

    // const avatarLocalUrl = req.files?avatar[0]
    const avatarLocalUrl = req.files?.avatar[0]?.path;
    if (!avatarLocalUrl) {
      res.status(400).json({ message: "Avatar file is required" });
    }
    const avatarResponse = await uploadOnCloudinary(avatarLocalUrl);
    // console.log(avatarUrl)
    if(!avatarResponse) {
      return res.status(400).json({
        message:"Unable to upload image | please try again"
      })
    }

    const user = await User.create({
      username,
      fullName,
      email,
      password,
      avatar: avatarResponse.url,
    });

    const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    return res.status(200).json({
      message: "User registered",
      user: createUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  //getting User email
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "all fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json({
      user: user,
      message: "User logged in successfully",
    });
};

const logoutUser = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({
      message: "Unable to logout",
    });
  }
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({
      message: "Successfully logout",
    });
};

const changePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  if (!password && !newPassword) {
    return res.status(400).json({ message: "all fields are required" });
  }
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "Unable to change password" });
  }
  const isPasswordCorrect = user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforseSave: false });
  return res.status(200).json({ message: "Password changed successfully" });
};

const updateUserAccountDetails = async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    return res
      .status(400)
      .json({ message: "Please provide at least one field to update" });
  }
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { fullName, email } },
    { new: true }
  );
  res.status(200).json({
    message: "User details updated successfully",
    user,
  });
};

const getCurrentUser = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("-password");
  return res.status(200).json({ user });
};

const getUserChannelProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username.trim()) {
      return res.status(400).json({ message: "username is required" });
    }

    const user = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
    ]);

    return res.status(200).json({user})
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              },
            },
          ],
        },
      },
    ]);

  return  res.status(200).json({ user: user[0].watchHistory });
  } catch (error) {
    return res.status(200).json({message:"Internal server error"})
  }
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  updateUserAccountDetails,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
};
