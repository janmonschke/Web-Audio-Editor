var connection = require('../database_connection')();
var scriptHelper = require('./script_helper');

var db = connection.database('audio-editor-users');

db.save('_design/user', {
  views: {
    byUsername: {
      map: "function (doc) { if (doc.type === 'user') { emit(doc.username, doc); } }"
    }
  }
});