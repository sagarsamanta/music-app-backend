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
      album.status = status?.toUpperCase();
      const updatedAlbum = await album[0].save();
      res
        .status(200)
        .send({ album: updatedAlbum._id, message: "sucessfully updated" });
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

exports.download = (req, res, next) => {
  const { doc_path } = req.body;
  try {
    const path =
      "public/2.png_278cadb5c5a600fd354bbb4a32acf34407bf98f01658143193507.png";
    const file = fs.createReadStream(doc_path);
    const filename = new Date().toISOString();
    file.on("error", function (err) {
      console.log("error1 " + err.message);
      // filestream.close();
      res.status(404).send({ message: "File Path Not found" }); // this error is in abc.txt???
    });

    file.on("finish", function () {
      console.log("finish");
    });
    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.removeFile = async (req, res) => {
  const { doc_path } = req.body;
  try {
    await unlinkAsync(doc_path, (error) => {
      if (error) {
        res.status(404).send({ message: "File path not found" });
      } else {
        res.status(200).send({ message: "Sucessfull" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to remove" });
  }
};
