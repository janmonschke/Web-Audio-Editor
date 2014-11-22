var opentok = require('opentok');
var connection = require('../database_connection')();
var db = connection.database('audio-editor-webrtc-sessions');
var config = require('../config/services_config');

var ot = new opentok(config.tokbox.apiKey, config.tokbox.secret);

module.exports = {
  get: function(arrangementId, cb){
    db.get(arrangementId, cb);
  },

  create: function(arrangementId, cb){
    // create a routed session
    ot.createSession({ mediaMode : "routed" }, function(err, session) {
      if (err) return console.log(err);
      session = { session_id : session.sessionId };
      // save the sessionId
      db.save(arrangementId, session, function(err, ok){
        cb(null, session);
      });
    });
  },

  generateToken: function(sessionId){
    console.log('generateToken', sessionId)
    return ot.generateToken(sessionId);
  }
};
