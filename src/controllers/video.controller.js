const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { Video } = require("../models/video.model.js");
const { default: mongoose } = require("mongoose");

const addVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const videoLocalPath = req.files.video[0].path;
    if (!videoLocalPath) {
      return res.status(400).json({ message: "Please upload a video." });
    }
    const cloudinaryVideoResponse = await uploadOnCloudinary(videoLocalPath);

    const thumbnailLocalPath = req.files.thumbnail[0].path;
    if (!thumbnailLocalPath) {
      return res.status(400).json({ message: "Please upload a thumbnail." });
    }
    const cloudinaryThumbnailResponse = await uploadOnCloudinary(
      thumbnailLocalPath
    );

    const video = await Video.create({
      title,
      description,
      videoFile: cloudinaryVideoResponse.secure_url,
      thumbnail: cloudinaryThumbnailResponse.secure_url,
      owner: req.user._id,
      duration: cloudinaryVideoResponse.duration,
    });
    // console.log(cloudinaryVideoResponse)

    // console.log(req.files)
    return res.status(200).json({
      message: "Successfully uploaded",
      video,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      videos,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: "video ID is misssing;" });
    }
    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
              },
            },
          ],
        },
      },
    ]);

    if (!video.length) {
      return res.status(400).json({ message: "No video found :(" });
    }
    return res.status(200).json({
      video,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { addVideo, getAllVideos, getVideo };
