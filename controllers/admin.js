const User = require("../models/Users");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Upload = require("../models/Upload");
const Album = require("../models/Album");
const Song = require("../models/Song");

exports.getPendingAllAlbum = async (req, res) => {
  try {
    const allAlbum = await Album.find({ status: "PENDING" }).populate(
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
    const album = await Album.findById({ _id: albumId });
    if (!album) {
      res.status(201).send({ message: "No Album found" });
    } else {
      album.status = status?.toUpperCase();
      const updatedAlbum = await album.save();
      res.status(200).send({ album: updatedAlbum });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
