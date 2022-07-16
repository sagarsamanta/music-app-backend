const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  Id: {
    type: String,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    trim: true,
    required: true,
  },
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
    },
    process.env.JWT_SCERET
  );
  return token;
};

userSchema.statics.findByCredential = async (userName, password) => {
  const user = await User.findOne({
    userName: userName,
    password: password,
  });
  if (!user) {
    throw new Error("Unable to login!");
  }
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
