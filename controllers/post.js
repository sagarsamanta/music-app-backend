const Post = require("../models/Post");
const Upload = require("../models/Upload");

exports.createNewPost = async (req, res) => {
  const { link, caption } = req.body;
  let postDetails = "";
  try {
    if (typeof req.files?.image !== "undefined") {
      const { Location, Key, Bucket } = await s3Upload(req.files.image[0]);
      const { originalname, mimetype } = req.files?.image[0];

      //store album image to database
      const banner = new Upload({
        originalName: originalname,
        contentType: mimetype,
        hashFileName: Key,
        url: Location,
      });
      postDetails = await banner.save();
      let newPost = "";
      const isAnyPostExist = await Post.find();
      if (isAnyPostExist.length > 0) {
        const id = isAnyPostExist[0]._id;
        const { uploadId, url } = isAnyPostExist[0];
        //remove file from upload table
        await Upload.deleteOne({ uploadId });

        //remove file from s3 bucket
        await s3Remove(url);

        newPost = await Post.findByIdAndUpdate(
          { _id: id },
          {
            link,
            caption,
            url: Location,
            uploadId: postDetails._id,
          },
          {
            new: true,
          }
        );
      } else {
        newPost = new Post({
          link,
          caption,
          url: postDetails?._id,
        });
        const albumDetails = await newPost.save();
      }

      if (newAlbum) {
        res.status(200).send({
          message: "SUCCESSFULL",
          post: newPost,
        });
      }
    } else {
      res.status(201).send({
        message: "Album not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
};
