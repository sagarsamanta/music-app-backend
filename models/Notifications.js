const mongoose = require("mongoose");
const notificationSchema = mongoose.Schema({
  message: {
    type: String,
    trim: true,
  },
  albumId: {
    type: String,
    trim: true,
  },
  albumTitle: {
    type: String,
    trim: true,
  },
  songId: {
    type: String,
    trim: true,
  },
  userId: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    trim: true,
  },
  time: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    default: "UNSEEN",
  },
  type: {
    type: String,
    trim: true,
    default: "readOnly",
  },
  verified: {
    type: String,
    trim: true,
    default: "NO",
  },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
