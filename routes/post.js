const express = require("express");
const { createNewPost } = require("../controllers/post");
const { postUpload } = require("../middleware/Upload");
const router = express.Router();

router.post("/createNewPost", postUpload, createNewPost);

module.exports = router;
