// require("dotenv").config();
const dotenv = require('dotenv');
dotenv.config();
const app = require("./app.js");
const connectDB = require("./db/index.js");

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MONGO_DB ERROR - ", err));
// console.log("run")
