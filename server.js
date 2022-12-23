const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const postRoute = require("./routes/post");
require("dotenv").config();
app.use(express.static(__dirname + "/public"));
app.use(express.json({ extended: false }));
app.use(cors());
app.use(morgan("combined"));

// databse url
const DV = process.env.MONGO_URL;
// used port
const port = process.env.PORT;

// database connection
mongoose
  .connect(DV, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database Connected..");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/user", require("./routes/users"));
app.use("/api/post", postRoute);
app.use("/", (req, res) => {
  res.status(200).send("Server running test with changes");
});
//error handelar
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        message: "Unexpected file",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        message: "File limite exited",
      });
    }
  }
});

// listen server response
app.listen(port, () => {
  console.log(`SERVER WORKING ON ${port}`);
});
