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
  email: {
    type: String,
    trim: true,
  },
  client_type: {
    type: String,
    trim: true,
  },
  label_name: {
    type: String,
    trim: true,
  },
  royalties_name: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  full_address: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  phone_number: {
    type: String,
    trim: true,
  },
  ops_email: {
    type: String,
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
  }).select("-password");
  if (!user) {
    throw new Error("Unable to login!");
  }
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
