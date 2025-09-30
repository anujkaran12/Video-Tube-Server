const jwt = require("jsonwebtoken");
const { User } = require("../models/user.models.js");
const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken._id);

  req.user = user;
  next();
};
module.exports = { verifyToken };
