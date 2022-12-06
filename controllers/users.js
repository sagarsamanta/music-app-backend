const User = require("../models/Users");
const Notification = require("../models/Notifications");
const Upload = require("../models/Upload");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { s3Upload } = require("../middleware/AwsS3service");
const Creadit = require("../models/Creadit");
const Post = require("../models/Post");

const updateNoticationStatus = async (id, status, verified) => {
  const updatedNotification = await Notification.findByIdAndUpdate(
    { _id: id },
    { status, verified }
  );
};
const removeNotification = async (id) => {
  const updatedNotification = await Notification.findByIdAndDelete({ _id: id });
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
      noc_doc_url: noc_doc.Location,
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
      if (album_art) {
        res.status(200).send(album_art);
      } else {
        res.status(201).send({ message: "Song details not found!" });
      }
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
        verified: "NO",
        type: "Editable",
      });
      const sorted = getAllNotification.sort((a, b) => {
        const aDate = new Date(a.date + " " + a.time);
        const bDate = new Date(b.date + " " + b.time);
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
        // status: "UNSEEN",
      });
      const sorted = getAllNotification.sort((a, b) => {
        const aDate = new Date(a.date + " " + a.time);
        const bDate = new Date(b.date + " " + b.time);
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
  await updateNoticationStatus(id, "UNSEEN", "YES");
  res.status(200).send({ message: "Notification status updated sucessfully" });
};
exports.updateAlbumDetails = async (req, res) => {
  try {
    const {
      albumId,
      title,
      release_date,
      live_date,
      film_banner,
      film_producer,
      content_type,
      notificationId,
    } = req.body;
    await Album.findByIdAndUpdate(
      { _id: albumId },
      {
        title,
        release_date,
        live_date,
        film_banner,
        film_producer,
        content_type,
        status: "PENDING",
      }
    );
    await updateNoticationStatus(notificationId, "UNSEEN", "YES");
    res.status(200).send({
      message: "Album Updated Sucessfull",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Server error",
    });
  }
};
exports.updateSongDetails = async (req, res) => {
  try {
    const {
      songId,
      song_title,
      song_type,
      song_desc,
      language,
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
      notificationId,
    } = req.body;
    let song = await Song.find({ _id: songId });
    const albumId = song[0].albumId;
    console.log(albumId);
    await Song.findByIdAndUpdate(
      { _id: songId },
      {
        song_title,
        song_type,
        song_desc,
        language,
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
      }
    );
    await Album.findByIdAndUpdate({ _id: albumId }, { status: "PENDING" });
    await updateNoticationStatus(notificationId, "UNSEEN", "YES");
    res.status(200).send({
      message: "Song UpdatedSucessfull",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Server error",
    });
  }
};
exports.updateBulkNotificationStatus = async (req, res) => {
  const { data } = req.body;
  try {
    data.forEach(async (element) => {
      await Notification.findByIdAndUpdate(
        { _id: element._id },
        { status: "SEEN" }
      );
    });
    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error" });
  }
};
exports.getCreaditNotes = async (req, res) => {
  try {
    const { artist_name } = req.params;
    const artistInfo = await Creadit.find({ artist_name }).select(
      "artist_name expireFrom invoiceNo expireTo url createdAt -_id"
    );
    res.status(200).send({ creadit: artistInfo });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, userName } = req.body;
    const findUser = await User.findOne({ userName });
    if (!findUser) {
      return res.status(201).send({ message: "User Not Found!" });
    }
    if (findUser.password !== oldPassword) {
      return res.status(201).send({ message: "Wrong Creadentials!" });
    }
    await User.findByIdAndUpdate(
      { _id: findUser._id },
      { password: newPassword }
    );
    res.status(200).send({ message: "Password changes successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send("server error!");
  }
};
exports.getCurrentAdminPost = async (req, res) => {
  try {
    const findPost = await Post.findOne();
    if (findPost) {
      res.status(200).send({
        message: "Success",
        post: findPost,
      });
    } else {
      res.status(201).send({
        message: "No post found",
      });
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
};
exports.updateNotificationStatus = async (req, res) => {
  try {
    const notificationIds = req.body.notificationIds;
    notificationIds.forEach(async (id) => {
      await Notification.findByIdAndUpdate({ _id: id }, { status: "SEEN" });
    });
    res.status(200).send({
      message: "success",
    });
  } catch (err) {
    console.log(err)
    res.status(500).send("Server error");
  }
};
