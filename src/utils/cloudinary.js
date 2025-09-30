const { v2 } = require("cloudinary");
const fs = require("fs");
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;
    //uploading file on cloudinary
    const result = await v2.uploader.upload(file, { resource_type: "auto" });
    // console.log("File has been uploaded on cloudinary ", result);
    fs.unlinkSync(file);
    return result;
  } catch (error) {
    fs.unlinkSync(file);
    console.log("cloudinary error - ", error);
  }
};

module.exports = { uploadOnCloudinary };
