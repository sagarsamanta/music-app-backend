const mongoose = require("mongoose");
const documentSchema = mongoose.Schema({
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
  userName: {
    type: String,
    trim: true,
  },
  revanue: {
    type: Number,
    trim: true,
    default: 0,
  },
  total: {
    type: Number,
    trim: true,
    default: 0,
  },
});
const Doc = mongoose.model("Document", documentSchema);
module.exports = Doc;
