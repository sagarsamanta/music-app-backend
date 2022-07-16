const express = require("express");
const router = express.Router();
const user = require("../controllers/users");
const admin = require("../controllers/admin");
const { album_doc_upload, album_art_upload } = require("../middleware/Upload");
const authentication = require("../middleware/authentication");

// login user
router.post("/login", user.login);
//register a user
router.post("/register", user.register);
//create new album
router.post("/createAlbum", authentication, album_art_upload, user.createAlbum);
//add any document with authentication
router.post("/addDoc", album_doc_upload, user.addAlbumDocument);
//download any files with authentication
router.post("/download", user.download);
//get song details
router.post("/getSongDetais", user.getSongDetais);
//get all album name with song
router.get("/getAllAlbumWithSong", authentication, user.getAllAlbumWithSong);
//delete any files with authentication
router.delete("/remove", authentication, user.removeFile);

//admin controller

router.get("/getPendingAllAlbum", admin.getPendingAllAlbum);
router.get("/getSuccessAllAlbum", admin.getSuccessAllAlbum);
router.get("/getCancelAllAlbum", admin.getCancelAllAlbum);

router.post("/updateAlbumStatus", admin.updateAlbumStatus);
module.exports = router;
