const User = require("../models/Users");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Upload = require("../models/Upload");
const Album = require("../models/Album");
const Song = require("../models/Song");

//registration for user or admin
exports.register = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    if (role) {
      role = "USER";
    } else {
      role = "ADMIN";
    }
    let user = new User({
      userName,
      password,
      role,
    });
    const registerUser = await user.save();
    if (user) {
      res
        .status(200)
        .json({ message: "SUCCESSFULLY REGISTERED", user: registerUser });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: error.message });
  }
};

// login handelar for user or admin
exports.login = async (req, res) => {
  try {
    const user = await User.findByCredential(
      req.body.userName,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.cookie("music", token, {
      expires: new Date(Date.now() + 5000),
      httpOnly: true,
    });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(201).json({ error: error.message });
  }
};

//create new album which gives albumId as a sucessfull response
exports.createAlbum = async (req, res) => {
  const {
    title,
    release_date,
    live_date,
    film_banner,
    film_producer,
    content_type,
  } = req.body;
  const user = req.user;
  let banner_image_details = "";
  try {
    if (typeof req.files?.album_art !== "undefined") {
      const {
        filename,
        originalname,
        mimetype,
        destination,
        path: bannerPath,
      } = req.files?.album_art[0];
      //get buffter data of reqested banner
      const bufferDataForBanner = fs.readFileSync(
        path.join(__dirname + "/../public/" + req.files?.album_art[0].filename)
      );

      //store album image to database
      const banner = new Upload({
        avatar: bufferDataForBanner,
        originalName: originalname,
        contentType: mimetype,
        hashFileName: filename,
        bannerPath: bannerPath,
      });
      banner_image_details = await banner.save();

      //remove image stored in public directory
      await unlinkAsync(bannerPath);

      //create new album
      const newAlbum = new Album({
        title,
        release_date,
        live_date,
        film_banner,
        film_producer,
        content_type,
        album_art_id: banner_image_details?._id,
        user_id: user._id,
      });
      const albumDetails = await newAlbum.save();
      if (newAlbum) {
        res.status(200).send({
          message: "SUCCESSFULL",
          albumId: albumDetails?._id,
        });
      }
    } else {
      res.status(201).send({
        message: "Album not found",
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
};
// document add handelar
exports.addAlbumDocument = async (req, res) => {
  const {
    song_title,
    song_type,
    language,
    song_desc,
    gener,
    sub_gener,
    mood,
    singer,
    composer,
    director,
    star_cast,
    explicit,
    lyricist,
    crbt_start,
    crbt_name,
    albumId,
  } = req.body;
  let wav_file = "";
  let noc_doc = "";
  let upload_mp3 = "";
  try {
    if (typeof req.files?.wav_file !== "undefined") {
      wav_file =
        req.files?.wav_file[0].destination +
        "/" +
        req.files?.wav_file[0].filename;
    }
    if (typeof req.files?.noc_doc !== "undefined") {
      noc_doc =
        req.files?.noc_doc[0].destination +
        "/" +
        req.files?.noc_doc[0].filename;
    }
    if (typeof req.files?.upload_mp3 !== "undefined") {
      upload_mp3 =
        req.files?.upload_mp3[0].destination +
        "/" +
        req.files?.upload_mp3[0].filename;
    }
    const newSong = new Song({
      song_title,
      song_type,
      language,
      song_desc,
      gener,
      sub_gener,
      mood,
      singer,
      composer,
      director,
      star_cast,
      explicit,
      lyricist,
      crbt_start,
      crbt_name,
      wav_file,
      noc_doc,
      upload_mp3,
      albumId,
    });

    const songDetails = await newSong.save();
    await Album.updateOne(
      {
        _id: albumId,
      },
      {
        $push: {
          all_song: songDetails._id,
        },
      }
    );
    if (newSong) {
      res
        .status(200)
        .send({ message: "SUCCESSFULL", songDetails: songDetails });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

//document download handelar
exports.download = (req, res, next) => {
  const { doc_path } = req.body;
  try {
    const path =
      "public/Sagar Samanta - Jr Javascript.pdf_0aebbc7b5f547ee845c4db7a92edd14d6a80c6231656320384959.pdf";
    const file = fs.createReadStream(path);
    const filename = new Date().toISOString();
    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

//delete any document handelar
exports.removeFile = async (req, res) => {
  const { doc_path } = req.body;

  try {
    await unlinkAsync("public/upload_1655234249741.mp3");
    res.status(200).send({ message: "Sucessfull" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to remove" });
  }
};

//get all album with song
exports.getAllAlbumWithSong = async (req, res) => {
  try {
    const user = req.user;
    const data = await Album.find({ user_id: user._id }).populate("all_song");
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getSongDetais = async (req, res) => {
  try {
    const { albumId } = req.body;
    console.log(albumId);
    const song = await Album.findById(albumId);
    if (song) {
      const album_art_id = song.album_art_id;
      console.log(album_art_id);
      const album_art = await Upload.findById(album_art_id);
      // res.set("Content-Type", album_art[0].contentType);
      res.status(200).json({ data: album_art });
    } else {
      res.status(201).json({ message: "Image not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
