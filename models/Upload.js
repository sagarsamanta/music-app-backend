const mongoose = require("mongoose");
const imageUploadSchema = mongoose.Schema({
  originalName: {
    type: String,
  },
  avatar: {
    type: Buffer,
  },
  contentType: {
    type: String,
  },

  hashFileName: {
    type: String,
  },
  bannerPath: {
    type: String,
  },
});

const Upload = mongoose.model("Upload", imageUploadSchema);
module.exports = Upload;
