const mongoose = require("mongoose");
const postSchema = mongoose.Schema({
  caption: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
