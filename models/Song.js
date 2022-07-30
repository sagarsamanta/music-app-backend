const mongoose = require("mongoose");
const songSchema = mongoose.Schema({
  song_title: {
    type: String,
    trim: true,
  },
  song_type: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    trim: true,
  },
  song_desc: {
    type: String,
    trim: true,
  },
  gener: {
    type: String,
    trim: true,
  },
  sub_gener: {
    type: String,
    trim: true,
  },
  mood: {
    type: String,
    trim: true,
  },
  singer: {
    type: String,
    trim: true,
  },
  composer: {
    type: String,
    trim: true,
  },
  director: {
    type: String,
    trim: true,
  },
  star_cast: {
    type: String,
    trim: true,
  },
  explicit: {
    type: String,
    trim: true,
  },
  lyricist: {
    type: String,
    trim: true,
  },
  crbt_start: {
    type: String,
    trim: true,
  },
  crbt_name: {
    type: String,
    trim: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    trim: true,
    required: true,
  },
  wav_file_url: {
    type: String,
    trim: true,
  },
  wav_file_name: {
    type: String,
    trim: true,
  },
  noc_doc_url: {
    type: String,
    trim: true,
  },
  noc_doc_name: {
    type: String,
    trim: true,
  },
  upload_mp3_url: {
    type: String,
    trim: true,
  },
  upload_mp3_name: {
    type: String,
    trim: true,
  },
});

const Song = mongoose.model("Song", songSchema);
module.exports = Song;
