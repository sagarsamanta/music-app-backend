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

  user_id: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: "PENDING",
  },
  all_song: [{ type: mongoose.Types.ObjectId, ref: "Song" }],
  album_art_id: { type: mongoose.Types.ObjectId, ref: "Upload" },
});
// albumSchema.virtual("song", {
//   ref: "Song",
//   localField: "_id",
//   foreignField: "albumId",
// });

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
