const mongoose = require("mongoose");
const imageUploadSchema = mongoose.Schema({
  originalName: {
    type: String,
  },

  contentType: {
    type: String,
  },

  hashFileName: {
    type: String,
  },
  url: {
    type: String,
  },
});

const Upload = mongoose.model("Upload", imageUploadSchema);
module.exports = Upload;
