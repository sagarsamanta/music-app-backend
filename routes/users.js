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
//get song details
router.get("/getSongDetais/:albumId", user.getSongDetais);
//get all album name with song
router.get("/getAllAlbumWithSong", authentication, user.getAllAlbumWithSong);
//delete any files with authentication

//admin controller
router.get("/getPendingAllAlbum", admin.getPendingAllAlbum);
router.get("/getSuccessAllAlbum", admin.getSuccessAllAlbum);
router.get("/getCancelAllAlbum", admin.getCancelAllAlbum);
router.post("/updateAlbumStatus", admin.updateAlbumStatus);
router.post("/getAllSongs", admin.getAllSongs);
router.post("/download", admin.download);
router.post("/removeFile", admin.removeFile);
router.post("/updateSongInfo", admin.updateSongInfo);
router.post("/updateAlbumDetails", admin.updateAlbumDetails);
module.exports = router;
