const mongoose = require("mongoose");
const storeSchema = mongoose.Schema({
  artist_name: {
    type: String,
    trim: true,
  },
  generalCategory: {
    type: Boolean,
    trim: true,
    default: true,
  },
  crbtCategory: {
    type: Boolean,
    trim: true,
    default: false,
  },
  bangladeshCategory: {
    type: Boolean,
    trim: true,
    default: false,
  },
});

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
