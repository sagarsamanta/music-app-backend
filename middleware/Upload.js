const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const newId = uuidv4();

const songDetailsStorage = multer.memoryStorage();
const album_doc_upload = multer({
  storage: songDetailsStorage,
  limits: {
    fileSize: 3e8, // 300MB
  },
}).fields([
  { name: "wav_file", maxCount: 1 },
  { name: "noc_doc", maxCount: 1 },
  { name: "upload_mp3", maxCount: 1 },
]);

//
const albumArtStorage = multer.memoryStorage();

const album_art_upload = multer({
  storage: albumArtStorage,
  limits: {
    fileSize: 2e7, //  20 MB
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

//
const monthlyExcelStore = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public");
  },

  filename: function (req, file, cb) {
    console.log("multer", file);
    const { originalname } = file;
    cb(null, `${newId}-${originalname}`);
  },
});
let monthlyStoreDocUpload = multer({ storage: monthlyExcelStore }).single(
  "file"
);

//creadit note upload
const creaditNotesStorage = multer.memoryStorage();
const creaditNoteUpload = multer({
  storage: creaditNotesStorage,
  limits: {
    fileSize: 20000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    cb(undefined, true);
  },
}).fields([{ name: "file", maxCount: 1 }]);

//crate any public post
const postStorage = multer.memoryStorage();
const postUpload = multer({
  storage: postStorage,
  limits: {
    fileSize: 20000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    cb(undefined, true);
  },
}).fields([{ name: "image", maxCount: 1 }]);

module.exports = {
  album_doc_upload,
  album_art_upload,
  monthlyStoreDocUpload,
  creaditNoteUpload,
  postUpload,
};
