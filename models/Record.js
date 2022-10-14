const mongoose = require("mongoose");
const RecordSchema = mongoose.Schema(
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
  },
  { timestamps: true }
);
const Record = mongoose.model("Record", RecordSchema);
module.exports = Record;
