const express = require("express");
const router = express.Router();
const user = require("../controllers/users");
const admin = require("../controllers/admin");
const {
  album_doc_upload,
  album_art_upload,
  creaditNoteUpload,
} = require("../middleware/Upload");
const authentication = require("../middleware/authentication");
const {
  addDocument,
  getStreaminMonthStoreReportForTable,
  getStreamingMonthStoreReportForCharts,
  getRevanueMonthStoreReportForTable,
  getRevanueMonthStoreReportForCharts,
  removeUploadedExcel,
  getUserReports,
  getAllUplodedRecords,
  getYear,
} = require("../controllers/document");

// user controllers

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

//clear all notification
router.post("/updateBulkNotificationStatus", user.updateBulkNotificationStatus);
router.get("/getCreaditNotes/:artist_name", user.getCreaditNotes);
router.put("/changePassword", user.changePassword);

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
router.post("/createCreaditNotes", creaditNoteUpload, admin.createCreaditNotes);
router.get("/getAllArtistName", admin.getAllArtistName);

//Album or song currection notification
router.post(
  "/sendAlbumOrSongCurrectionNotification",
  admin.sendAlbumOrSongCurrectionNotification
);
router.get("/countAllAlbum", admin.countAllAlbum);
//Modify album details
router.post("/updateAlbumInfo", album_art_upload, admin.updateAlbumInfo);

//store access contarol
router.post("/storeAccess", admin.storeAccess);
router.delete("/deleteAlbum/:albumId", admin.deleteAlbum);

//doc controllers

//API for admin to upload only excel(.xlsx) file
router.post("/uploadDoc/:storeName/:year/:month", addDocument);

//API for streaming table both store and month report (pass user or artist name pas a params)
router.get(
  "/getStreaminMonthStoreReportForTable/:artist_name/:year",
  getStreaminMonthStoreReportForTable
);

//APi for streaming both bar and pie chart
router.get(
  "/getStreamingMonthReportForCharts/:artist_name/:year",
  getStreamingMonthStoreReportForCharts
);

//API for revanue table both store and month report (pass user or artist name pas a params)
router.get(
  "/getRevanueMonthStoreReportForTable/:artist_name/:year",
  getRevanueMonthStoreReportForTable
);

//APi for revanue both bar and pie chart
router.get(
  "/getRevanueMonthStoreReportForCharts/:artist_name/:year",
  getRevanueMonthStoreReportForCharts
);

//API for donload user reports
router.get(
  "/getUserReports/:artist_name/:storeName/:year/:month",
  getUserReports
);

//API for admin uploaded all record table
router.get("/getAllUplodedRecords", getAllUplodedRecords);
router.get("/getYear/:artist_name", getYear);

//API for delete any uploaded record
router.delete(
  "/removeUploadedExcel/:storeName/:year/:month",
  removeUploadedExcel
);

module.exports = router;
