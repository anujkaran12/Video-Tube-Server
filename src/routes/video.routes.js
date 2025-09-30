const { Router } = require("express");
const {
  addVideo,
  getAllVideos,
  getVideo,
} = require("../controllers/video.controller.js");

const { uploads } = require("../middlewares/multer.js");
const { verifyToken } = require("../middlewares/auth.middleware.js");

const videoRouter = Router();

videoRouter.route("/addVideo").post(
  verifyToken,
  uploads.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  addVideo
);

videoRouter.route("/allVideos").get(getAllVideos);
videoRouter.route("/:videoId").get(getVideo)
module.exports = { videoRouter };
