var rtg = require('url').parse(process.env.REDISTOGO_URL || '');
rtg.auth = rtg.auth ? rtg.auth : ''

///////// PRODUCTION /////////
var prodConfig = {
  type: 'production',
  appPort: process.env.PORT,
  redis:{
    port: rtg.port,
    host: rtg.hostname,
    pass: rtg.auth.split(':')[1]
  },
  db: {
    admin: process.env.db_admin,
    password: process.env.db_password,
    protocol: 'https',
    host: process.env.db_host,
    port: process.env.db_port,
    name: process.env.db_name
  },
  aws: {
    s3Bucket: process.env.S3_BUCKET,
    accessKey: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY
  },
  tokbox: {
    secret: process.env.TOKBOX_SECRET,
    apiKey: process.env.TOKBOX_API_KEY
  },
  salt: process.env.salt,
  sessionSecret: process.env.session_secret
};

///////// DEVELOPMENT /////////
var devConfig = {};
try{
  devConfig = require('./config');
}catch(e){

}

// get the node environment from the variable or default to development
var node_env = process.env['NODE_ENV'] || 'development';
var config = node_env == 'production' ? prodConfig : devConfig;

module.exports = config;