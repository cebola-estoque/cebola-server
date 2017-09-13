// native
const path = require('path');

// third-party
const multer   = require('multer');
const multerS3 = require('multer-s3');
const aws      = require('aws-sdk');
const mime     = require('mime');
const uuid     = require('uuid');

module.exports = function (app, options) {

  if (!options.awsS3Bucket) {
    throw new Error('awsS3Bucket required');
  }

  // let storage = multer.diskStorage({
  //   destination: path.join(__dirname, '../../tmp-uploads'),
  //   filename: function (req, file, cb) {

  //     let filename = uuid.v4() + '.' + mime.extension(file.mimetype);

  //     cb(null, filename);
  //   }
  // });

  let s3 = new aws.S3();

  let s3Storage = multerS3({
    s3: s3,
    bucket: options.awsS3Bucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      let filename = uuid.v4() + '.' + mime.extension(file.mimetype);
      cb(null, filename);
    }
  });

  let uploadSvc = multer({
    storage: s3Storage,
  });

  app.services.upload = uploadSvc;
};
