const mongoose = require("mongoose");
const documentSchema = mongoose.Schema(
  {
    storeName: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    month: {
      type: String,
      trim: true,
    },
    product: {
      type: String,
      trim: true,
    },
    isrc: {
      type: String,
      trim: true,
    },
    song_name: {
      type: String,
      trim: true,
    },
    mtoolId: {
      type: String,
      trim: true,
    },
    composer_name: {
      type: String,
      trim: true,
    },
    royalty : {
      type: Number,
      trim: true,
      default: 0,
    },
    total: {
      type: Number,
      trim: true,
      default: 0,
    },
  },
  { timestamps: true }
);
const Doc = mongoose.model("Document", documentSchema);
module.exports = Doc;
