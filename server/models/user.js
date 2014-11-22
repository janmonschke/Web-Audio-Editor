var bcrypt = require('bcrypt');
var connection = require('../database_connection')();
var db = connection.database('audio-editor-users');

module.exports = {
  get: function(id, cb){
    db.get(String(id), cb);
  },

  findByName: function(name, cb){
    db.view('user/byUsername', { key: name }, function(err, res){
      if(err || res.length == 0)
        return cb(null, null);
      cb(null, res[0].value);
    });
  },

  create: function(data, cb){
    // don't allow to set an id
    delete data._id
    delete data.id

    data.type = 'user';

    // save the date of creation
    data.created_at = Date.now();

    db.save(data, function(err, res){
      if(err)
        return cb(err)

      data._rev = res.rev
      data._id = res.id

      cb(null, data);
    });
  },

  createWithPassword: function(data, pw, cb){
    var User = this;
    User.findByName(data.username, function(err, user){
      if(user)
        return done({message: 'Username already taken'});

      // hash the password and create the user
      bcrypt.hash(pw, 10, function(err, hash) {
        User.create({
          username: data.username,
          email: data.email,
          pwhash: hash
        }, cb);
      });
    });
  }
};