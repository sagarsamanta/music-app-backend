const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
require("dotenv").config();
const authentication = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SCERET);

    const user = await Users.findOne({
      _id: decoded._id,
      // "tokens.token": token,
    });
    if (!user) {
      console.log(decoded)
      throw new Error("Please authenticate!");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send({ Error: "please authenticate!" });
  }
};
module.exports = authentication;
