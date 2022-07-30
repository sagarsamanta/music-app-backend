const AWS = require("aws-sdk");
require("dotenv").config();
const uuid = require("uuid").v4;

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
exports.s3Upload = async (file) => {
  const param = {
    Body: file.buffer,
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuid()}-${file.originalname}`,
  };
  return await s3.upload(param).promise();
};

exports.s3Remove = async (filename) => {
  let params = { Bucket: process.env.AWS_BUCKET_NAME, Key: filename };
  const isDeleted = await s3.deleteObject(params, function (err, data) {
    if (err) {
      return false;
    } else {
      return true;
    }
  });
  if (isDeleted) {
    return true;
  } else {
    return false;
  }
};
// exports.SongDocS3Upload = async (files) => {
//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `uploads/${uuid()}-${file.originalname}`,
//       Body: file.buffer,
//     };
//   });

//   return await Promise.all(params.map((param) => s3.upload(param).promise()));
// };
