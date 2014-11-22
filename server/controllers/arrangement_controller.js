var crypto = require('crypto');
var config = require('../config/services_config');
var Arrangement = require('../models/arrangement');
var knox = require('knox');

// the s3 client
var s3Client = knox.createClient({
  key: config.aws.accessKey,
  secret: config.aws.secret,
  bucket: config.aws.s3Bucket
});

module.exports = {
  create: function(req, res){
    if(!req.user) return res.json({messages: 'Unauthorized, please log in.'}, 404);
    var ownerId = req.user._id;
    var title = req.body.title;

    Arrangement.create(title, ownerId, function(err, arrangement){
      if(err){
        return res.json({message: err}, 500);
      }
      res.redirect('/arrangement/' + arrangement._id);
    });
  },

  signS3: function(req,res){
    var object_name = req.query.s3_object_name;
    var mime_type = req.query.s3_object_type;

    var now = new Date();
    var expires = Math.ceil((now.getTime() + 2 * 60 * 60 * 1000)/1000); // two hours
    var amz_headers = "x-amz-acl:public-read";

    var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+config.aws.s3Bucket+"/"+object_name;

    var signature = crypto.createHmac('sha1', config.aws.secret).update(put_request).digest('base64');
    signature = encodeURIComponent(signature.trim());

    var url = 'https://'+config.aws.s3Bucket+'.s3.amazonaws.com/'+object_name;

    var credentials = {
      signed_request: url+"?AWSAccessKeyId="+config.aws.accessKey+"&Expires="+expires+"&Signature="+signature,
      url: url
    };
    res.write(JSON.stringify(credentials));
    res.end();
  },

  deleteUpload: function(req, res){
    s3Client.deleteFile(req.params.s3Id, function(err, response){
      if(err) return res.json({error: err}, 500);
      res.json({ok: true});
    });
  }
};