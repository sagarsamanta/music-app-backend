const User = require("../models/Users");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notifications");
const { promisify } = require("util");
const Upload = require("../models/Upload");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { s3Upload } = require("../middleware/AwsS3service");

const updateNoticationStatus = async (id) => {
  const updatedNotification = await Notification.findByIdAndUpdate(
    { _id: id },
    { status: "SEEN" }
  );
};
//registration for user or admin
exports.register = async (req, res) => {
  try {
    let {
      userName,
      email,
      client_type,
      label_name,
      royalties_name,
      designation,
      full_address,
      country,
      phone_number,
      ops_email,
      password,
      role,
    } = req.body;
    if (role) {
      role = "USER";
    } else {
      role = "ADMIN";
    }

    const isMobileRegister = await User.find({ phone_number });
    const isUsedUserName = await User.find({ userName });

    const isEmailRegister = await User.find({ email });
    if (isUsedUserName.length > 0) {
      res.status(201).json({ message: "User Name Alredy Taken" });
    } else if (isEmailRegister.length > 0) {
      res.status(201).json({ message: "Email Alredy Registered" });
    } else if (isMobileRegister.length > 0) {
      res.status(201).json({ message: "Mobile No Alredy Registered" });
    } else {
      let user = new User({
        userName,
        email,
        client_type,
        label_name,
        royalties_name,
        designation,
        full_address,
        country,
        phone_number,
        ops_email,
        password,
        role,
      });
      const registerUser = await user.save();
      if (user) {
        res
          .status(200)
          .json({ message: "SUCCESSFULLY REGISTERED", user: registerUser });
      }
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
      const { Location, Key, Bucket } = await s3Upload(req.files.album_art[0]);
      const { originalname, mimetype } = req.files?.album_art[0];

      //store album image to database
      const banner = new Upload({
        originalName: originalname,
        contentType: mimetype,
        hashFileName: Key,
        url: Location,
      });
      banner_image_details = await banner.save();

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
  // const { Location, Key, Bucket }
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
      wav_file = await s3Upload(req.files.wav_file[0]);
    }
    if (typeof req.files?.noc_doc !== "undefined") {
      noc_doc = await s3Upload(req.files.noc_doc[0]);
    }
    if (typeof req.files?.upload_mp3 !== "undefined") {
      upload_mp3 = await s3Upload(req.files.upload_mp3[0]);
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
      wav_file_url: wav_file.Location,
      wav_file_name: wav_file.Key,
      noc_doc_url: wav_file.Location,
      noc_doc_name: noc_doc.Key,
      upload_mp3_url: upload_mp3.Location,
      upload_mp3_name: upload_mp3.Key,

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
    const albumId = req.params.albumId;
    const song = await Album.findById(albumId);
    if (song) {
      const album_art_id = song.album_art_id;
      const album_art = await Upload.findById(album_art_id);
      // res.set("Content-Type", "image/jpeg");
      res.status(200).send(album_art);
    } else {
      res.status(201).json({ message: "Image not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getNotifyForm = async (req, res) => {
  try {
    const { id } = req.body;
    const isValidNotification = await Notification.find({ _id: id });
    if (isValidNotification.length === 0) {
      return res.status(201).send({ message: "Invalid notification " });
    } else {
      const { message, songId, albumId } = isValidNotification[0];
      if (songId) {
        const song = await Song.find({ _id: songId });
        res.status(200).send({
          SongDetails: song[0],
          form_type: "Song",
          errorMessage: message,
        });
      } else if (albumId) {
        const album = await Album.find({ _id: albumId }).populate(
          "album_art_id",
          "-_id url"
        );
        res.status(200).send({
          albumDetails: album[0],
          form_type: "Album",
          errorMessage: message,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAlbumSongCurrectionNotification = async (req, res) => {
  try {
    const { userId } = req.body;
    const isValidUser = await User.find({ _id: userId });
    if (isValidUser.length === 0) {
      return res.status(201).send({ message: "Invalid User Id " });
    } else {
      const getAllNotification = await Notification.find({
        userId,
        status: "UNSEEN",
        type: "Editable",
      });
      const sorted = getAllNotification.sort((a, b) => {
        const aDate = new Date(a.date + " " + a.time);
        const bDate = new Date(b.date + " " + b.time);
        console.log(aDate, bDate);
        return bDate.getTime() - aDate.getTime();
      });
      res.status(200).send({
        allNotification: sorted,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllNotification = async (req, res) => {
  try {
    const { userId } = req.body;
    const isValidUser = await User.find({ _id: userId });
    if (isValidUser.length === 0) {
      return res.status(201).send({ message: "Invalid User Id " });
    } else {
      const getAllNotification = await Notification.find({
        userId,
        status: "UNSEEN",
      });
      const sorted = getAllNotification.sort((a, b) => {
        const aDate = new Date(a.date + " " + a.time);
        const bDate = new Date(b.date + " " + b.time);
        console.log(aDate, bDate);
        return bDate.getTime() - aDate.getTime();
      });
      res.status(200).send({
        allNotification: sorted,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateSingleNotificationStatus = async (req, res) => {
  const { id } = req.body;
  await updateNoticationStatus(id);
  res.status(200).send({ message: "Notification status updated sucessfully" });
};
