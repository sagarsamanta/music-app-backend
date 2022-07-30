const User = require("../models/Users");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Upload = require("../models/Upload");
const Album = require("../models/Album");
const Song = require("../models/Song");
const { s3Remove } = require("../middleware/AwsS3service");

exports.getPendingAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "PENDING" })
      .populate("user_id", "-_id userName")
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
    let { albumId, status } = req.body;
    if (!status) status = "PENDING";
    const album = await Album.find({ _id: albumId });
    if (album.length == 0) {
      res.status(201).send({ message: "No Album found" });
    } else {
      album[0].status = status?.toUpperCase();
      const updatedAlbum = await album[0].save();
      res
        .status(200)
        .send({ album: updatedAlbum, message: "sucessfully updated" });
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
        await Song.findByIdAndUpdate({ _id: songId }, { upload_mp3_url: "" });
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