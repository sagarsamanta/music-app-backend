const mongoose = require("mongoose");
const creaditSchema = mongoose.Schema(
  {
    artist_name: {
      type: String,
    },

    expireFrom: {
      type: String,
    },

    expireTo: {
      type: String,
    },
    fileInfo: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

const Creadit = mongoose.model("Creadit", creaditSchema);
module.exports = Creadit;
