const Notification = require("../models/Notifications");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { s3Remove, s3Upload } = require("../middleware/AwsS3service");
const Upload = require("../models/Upload");
const Creadit = require("../models/Creadit");
const User = require("../models/Users");

//notification create handelar
const createNotification = async (data) => {
  const dateAndTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  const date = dateAndTime.split(",")[0];
  const time = dateAndTime.split(",")[1];
  data.date = date;
  data.time = time;
  const notification = new Notification(data);
  const newNotification = await notification.save();
  return newNotification;
};

exports.getPendingAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "PENDING" })
      .populate("user_id", "_id userName client_type")
      .populate("all_song");
    if (allAlbum.length <= 0) {
      res.status(201).send({ message: "No Album found", album: allAlbum });
    } else {
      res.status(200).send({ album: allAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getUnderVerificationAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "UNDER VERIFICATION" })
      .populate("user_id", "_id userName client_type")
      .populate("all_song");
    if (allAlbum.length <= 0) {
      res.status(201).send({ message: "No Album found", album: allAlbum });
    } else {
      res.status(200).send({ album: allAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getReleasedAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "RELEASED" })
      .populate("user_id", "_id userName client_type")
      .populate("all_song");
    if (allAlbum.length <= 0) {
      res.status(201).send({ message: "No Album found", album: allAlbum });
    } else {
      res.status(200).send({ album: allAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getSuccessAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "SUCCESS" }).populate(
      "user_id",
      "-_id userName client_type"
    );
    if (allAlbum.length <= 0) {
      res.status(201).send({ message: "No Album found", album: allAlbum });
    } else {
      res.status(200).send({ album: allAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getCancelAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "CANCEL" }).populate(
      "user_id",
      "-_id userName client_type"
    );
    if (allAlbum.length <= 0) {
      res.status(201).send({ message: "No Album found", album: allAlbum });
    } else {
      res.status(200).send({ album: allAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.updateAlbumStatus = async (req, res) => {
  try {
    let { albumId, status, message } = req.body;
    if (!status) status = "PENDING";
    const album = await Album.find({ _id: albumId });
    if (album.length == 0) {
      res.status(201).send({ message: "No Album found" });
    } else {
      album[0].status = status?.toUpperCase();
      const updatedAlbum = await album[0].save();
      const albumTitle = updatedAlbum.title;
      const userId = updatedAlbum.user_id;
      //create notification
      const data = { albumId, albumTitle, userId, message };
      const notification = await createNotification(data);
      res.status(200).send({
        message: "Sucessfully Updated",
        notification,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getAllSongs = async (req, res) => {
  try {
    const { albumId } = req.body;
    const allSong = await Song.find({ albumId }).populate("albumId");
    if (allSong.length == 0) {
      res.status(201).send({ message: "No image found", data: allSong });
    } else {
      res.status(200).send({ data: allSong });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.removeFile = async (req, res) => {
  const { doc_path, songId, fieldName } = req.body;
  const Key = doc_path;
  try {
    const isDeleted = await s3Remove(Key);
    if (isDeleted) {
      if (fieldName === "wav_file") {
        await Song.findByIdAndUpdate({ _id: songId }, { wav_file_url: "" });
        return res.status(200).send({
          message: "Wave file removed",
        });
      } else if (fieldName === "doc_file") {
        await Song.findByIdAndUpdate({ _id: songId }, { noc_doc_url: "" });
        return res.status(200).send({
          message: "Doc file remove",
        });
      } else if (fieldName === "mp3_file") {
        await Song({ _id: songId }, { upload_mp3_url: "" });
        return res.status(200).send({
          message: "Mp3 file remove",
        });
      }
    } else {
      return res.status(400).send({
        message: "Failed to remove",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to remove" });
  }
};
exports.updateSongInfo = async (req, res) => {
  try {
    const id = req.body.songId;
    if (!id) {
      return res.status(201).send({ message: "Invalid song Id" });
    }
    const updatedSong = await Song.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({ data: updatedSong });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.countAllAlbum = async (req, res) => {
  try {
    const pendingAlbum = await Album.find({ status: "PENDING" });
    const approvedAlbum = await Album.find({ status: "SUCCESS" });
    const canclealbum = await Album.find({ status: "CANCEL" });
    const realesedAlbum = await Album.find({ status: "RELEASED" });
    const underVerificationAlbum = await Album.find({
      status: "UNDER VERIFICATION",
    });
    res.status(200).send({
      pending: pendingAlbum.length,
      success: approvedAlbum.length,
      cancle: canclealbum.length,
      released: realesedAlbum.length,
      underVerification: underVerificationAlbum.length,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};
exports.sendAlbumOrSongCurrectionNotification = async (req, res) => {
  try {
    const { albumId, songId, message } = req.body;
    if (albumId) {
      const album = await Album.find({ _id: albumId });
      if (album.length === 0) {
        return res.status(201).send("Album not found");
      } else {
        const userId = album[0].user_id;
        const albumTitle = album[0].title;
        const type = "Editable";

        const data = { albumId, albumTitle, userId, message, type };
        const notification = await createNotification(data);
        await Album.findByIdAndUpdate(
          { _id: albumId },
          { status: "UNDER VERIFICATION" }
        );
        res.status(200).send({
          message: "Successful",
          notification: notification,
        });
      }
    } else if (songId) {
      const song = await Song.find({ _id: songId });
      if (song.length === 0) {
        return res.status(201).send("Song not found");
      } else {
        let { albumId } = song[0];
        const findAlbum = await Album.find({ _id: albumId });
        if (findAlbum.length === 0) {
          return res.status(201).send("Song not belongs to any album");
        } else {
          const userId = findAlbum[0].user_id;
          const albumTitle = findAlbum[0].title;
          const type = "Editable";
          const data = { songId, albumTitle, userId, message, type };
          const notification = await createNotification(data);
          await Album.findByIdAndUpdate(
            { _id: albumId },
            { status: "UNDER VERIFICATION" }
          );
          res.status(200).send({
            message: "Successful",
            notification,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.sendAnyNotification = async (req, res) => {
  const { userId, message } = req.body;
};
exports.updateAlbumInfo = async (req, res) => {
  const {
    albumId,
    label,
    catalogNo,
    upc,
    trackDuration,
    relInBangladesh,
    othersInfo,
  } = req.body;
  if (!relInBangladesh) {
    relInBangladesh = false;
  }
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
      const album = await Album.findByIdAndUpdate(
        { _id: albumId },
        {
          label,
          catalogNo,
          upc,
          trackDuration,
          relInBangladesh,
          othersInfo,
          album_art_id: banner_image_details?._id,
          status: "RELEASED",
        }
      );
      const uploadedFile = await Upload.findByIdAndDelete({
        _id: album.album_art_id,
      });
      const key = uploadedFile.hashFileName;
      await s3Remove(Key);
      res.status(200).send({
        message: "SUCCESSFULL",
      });
    } else {
      res.status(201).send({
        message: "Album not found",
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
};
exports.createCreaditNotes = async (req, res) => {
  const { artist_name, invoiceNo, PaymentRelease } = req.body;
  let creaditNotesFile = "";
  try {
    if (typeof req.files?.file !== "undefined") {
      const { Location, Key, Bucket } = await s3Upload(req.files.file[0]);
      const { originalname, mimetype } = req.files?.file[0];

      //store album image to database
      const file = new Upload({
        originalName: originalname,
        contentType: mimetype,
        hashFileName: Key,
        url: Location,
      });
      creaditNotesFile = await file.save();

      //create new album
      const newCreaditNote = new Creadit({
        artist_name,
        fileInfo: file._id,
        invoiceNo,
        paymentRelease: Number(PaymentRelease),
        url: Location,
      });
      const creaditNote = await newCreaditNote.save();
      if (creaditNote) {
        res.status(200).send({
          message: "SUCCESSFULL",
          creaditNote: creaditNote?._id,
        });
      }
    } else {
      res.status(201).send({
        message: "Something went wrong!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
};
exports.getAllArtistName = async (req, res) => {
  try {
    const allArtist = await User.find().distinct("userName");
    res.status(200).send(allArtist);
  } catch (error) {
    res.status(500).send("Server error");
  }
};
exports.updateAlbumDetails = async (req, res) => {
  try {
    const albumId = req.body.albumId;
    if (!albumId) {
      return res.status(201).send({ message: "Invalid Album Id" });
    }
    const updatedAlbum = await Album.findByIdAndUpdate(
      { _id: albumId },
      req.body,
      {
        new: true,
      }
    );
    const { _id, title, user_id } = updatedAlbum;
    const data = {
      albumId: _id,
      albumTitle: title,
      userId: user_id,
      message: "Album updated to next step!",
    };
    const notification = await createNotification(data);
    res.status(200).send({ data: updatedAlbum });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateStoreAccess = async (req, res) => {
  try {
    const { userName, generalCategory, crbtCategory, bangladeshCategory } =
      req.body;
    if (userName) {
      await User.updateOne(
        { userName: userName },
        { generalCategory, crbtCategory, bangladeshCategory }
      );
      return res.status(200).send({ message: "Successfull" });
    } else {
      return res.status(400).send({ message: "User name is required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
exports.deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    if (!albumId)
      return res.status(201).send({ message: "Invalid album id!." });
    await Album.findByIdAndDelete({ _id: albumId });
    const data = await Song.deleteMany({ albumId: albumId });
    console.log(data);
    res.status(200).send({ message: "Successfull" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const { artistName } = req.params;
    if (artistName) {
      const user = await User.findOne({ userName: artistName });
      const userAlbum = await Album.find({ user_id: user._id });
      res.status(200).send({
        user,
        albumList: userAlbum,
      });
    } else {
      res.status(400).send({
        message: "User name is required",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};
