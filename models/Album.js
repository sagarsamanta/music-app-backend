const mongoose = require("mongoose");
const albumSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  release_date: {
    type: String,
    trim: true,
  },
  live_date: {
    type: String,
    trim: true,
  },
  film_banner: {
    type: String,
    trim: true,
  },
  film_producer: {
    type: String,
    trim: true,
  },
  content_type: {
    type: String,
    trim: true,
  },
  user_id: { type: mongoose.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    default: "PENDING",
  },
  all_song: [{ type: mongoose.Types.ObjectId, ref: "Song" }],
  album_art_id: { type: mongoose.Types.ObjectId, ref: "Upload" },
  label: {
    type: String,
    trim: true,
  },
  catalogNo: {
    type: String,
    trim: true,
  },
  upc: {
    type: String,
    trim: true,
  },
  isrc: {
    type: String,
    trim: true,
  },
  trackDuration: {
    type: String,
    trim: true,
  },
  relInBangladesh: {
    type: Boolean,
    trim: true,
    default: false,
  },
  othersInfo: {
    type: String,
    trim: true,
  },
});

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
