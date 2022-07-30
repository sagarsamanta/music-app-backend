const multer = require("multer");

const songDetailsStorage = multer.memoryStorage();

const album_doc_upload = multer({
  storage: songDetailsStorage,
  limits: {
    fileSize: 3e8, // 10000000 Bytes = 10 MB
  },
}).fields([
  { name: "wav_file", maxCount: 1 },
  { name: "noc_doc", maxCount: 1 },
  { name: "upload_mp3", maxCount: 1 },
]);

const albumArtStorage = multer.memoryStorage();
const album_art_upload = multer({
  storage: albumArtStorage,
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

// const album_art_storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, "public");
//   }, // Destination to store video
//   filename: (req, file, cb) => {
//     const crypt = sha1(file.originalname);
//     // console.log("called1");

//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   },
// });

// const album_doc_storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, "public");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   },
// });
