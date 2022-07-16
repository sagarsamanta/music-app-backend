const multer = require("multer");
const path = require("path");
const sha1 = require("sha1");

const album_doc_storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public");
  }, // Destination to store video
  filename: (req, file, cb) => {
    const crypt = sha1(file.originalname);

    cb(
      null,
      file.originalname +
        "_" +
        crypt +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const album_doc_upload = multer({
  storage: album_doc_storage,
  limits: {
    fileSize: 3e8, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    // upload only mp4 and mkv format
    // if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
    //   return cb(new Error("Please upload a video"));
    // }

    // const audiobookFilter = (req, file, cb) => {
    //   if ( file.mimetype == "audio/mp4a-latm" || file.mimetype == "audio/mpeg" || file.mimetype == "application/zip" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
    //   cb(null, true) } else { cb(null, false)}
    //   }

    cb(undefined, true);
  },
}).fields([
  { name: "wav_file", maxCount: 1 },
  { name: "noc_doc", maxCount: 1 },
  { name: "upload_mp3", maxCount: 1 },
]);
const album_art_storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public");
  }, // Destination to store video
  filename: (req, file, cb) => {
    const crypt = sha1(file.originalname);
    // console.log("called1");

    cb(
      null,
      file.originalname +
        "_" +
        crypt +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});
const album_art_upload = multer({
  storage: album_art_storage,
  limits: {
    fileSize: 20000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    // upload only mp4 and mkv format
    // if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
    //   return cb(new Error("Please upload a video"));
    // }

    // const audiobookFilter = (req, file, cb) => {
    //   if ( file.mimetype == "audio/mp4a-latm" || file.mimetype == "audio/mpeg" || file.mimetype == "application/zip" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
    //   cb(null, true) } else { cb(null, false)}
    //   }

    cb(undefined, true);
  },
}).fields([{ name: "album_art", maxCount: 1 }]);

module.exports = {
  album_doc_upload,
  album_art_upload,
};

