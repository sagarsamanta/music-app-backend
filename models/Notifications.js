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
  songId: {
    type: String,
    trim: true,
  },
  userId: {
    type: String,
    trim: true,
  },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
