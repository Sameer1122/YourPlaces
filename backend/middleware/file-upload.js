const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const uuid = require("uuid/v1");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});
// Stores files on aws s3
const s3 = new aws.S3({
  region: process.env.Region,
  accessKeyId: process.env.Access_Key_ID,
  secretAccessKey: process.env.Secret_Access_Key,
});

const s3upload = multer({
  storage: multerS3({
    s3,
    bucket: "my-memory-book",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
});

module.exports = s3upload;
