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
//get form details using notification id
router.post("/getNotifyForm", user.getNotifyForm);
//get any type of notification
router.post("/getAllNotification", user.getAllNotification);
//get only album or song currection notifications
router.post(
  "/getAlbumSongCurrectionNotification",
  user.getAlbumSongCurrectionNotification
);
//update single notification status
router.post(
  "/updateSingleNotificationStatus",
  user.updateSingleNotificationStatus
);
//update album
router.post("/updateAlbumDetails", user.updateAlbumDetails);
//update song
router.post("/updateSongDetails", user.updateSongDetails);
router.post("/updateBulkNotificationStatus", user.updateBulkNotificationStatus);

//admin controller
router.get("/getPendingAllAlbum", admin.getPendingAllAlbum);
router.get("/getReleasedAllAlbum", admin.getReleasedAllAlbum);
router.get("/getSuccessAllAlbum", admin.getSuccessAllAlbum);
router.get("/getCancelAllAlbum", admin.getCancelAllAlbum);
router.get("/getUnderVerificationAllAlbum", admin.getUnderVerificationAllAlbum);
router.post("/updateAlbumStatus", admin.updateAlbumStatus);
router.post("/getAllSongs", admin.getAllSongs);
router.post("/removeFile", admin.removeFile);
router.post("/updateSongInfo", admin.updateSongInfo);
router.post("/updateAlbumDetails", admin.updateAlbumDetails);
//Album or song currection notification
router.post(
  "/sendAlbumOrSongCurrectionNotification",
  admin.sendAlbumOrSongCurrectionNotification
);
router.get("/countAllAlbum", admin.countAllAlbum);
//Modify album details
router.post("/updateAlbumInfo", album_art_upload, admin.updateAlbumInfo);
module.exports = router;
