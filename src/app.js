const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'))

// import router
const {userRouter} = require('./routes/user.routes.js');
const {videoRouter} = require('./routes/video.routes.js');

app.use("/api/v1/users",userRouter)

app.use("/api/v1/videos",videoRouter)





module.exports = app;
