const Notification = require("../models/Notifications");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { s3Remove } = require("../middleware/AwsS3service");

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
      "-_id userName"
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
    const allAlbum = await Album.find({ status: "CANCLE" }).populate(
      "user_id",
      "-_id userName"
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
exports.updateAlbumDetails = async (req, res) => {
  try {
    const id = req.body.albumId;
    if (!id) {
      return res.status(201).send({ message: "Invalid Album Id" });
    }
    const updatedAlbum = await Album.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).send({ data: updatedAlbum });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.countAllAlbum = async (req, res) => {
  try {
    const pendingAlbum = await Album.find({ status: "PENDING" });
    const approvedAlbum = await Album.find({ status: "SUCCESS" });
    const canclealbum = await Album.find({ status: "CANCLE" });
    const realesedAlbum = await Album.find({ status: "RELEASED" });
    res.status(200).send({
      pending: pendingAlbum.length,
      success: approvedAlbum.length,
      cancle: canclealbum.length,
      released: realesedAlbum.length,
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
