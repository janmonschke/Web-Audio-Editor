var connection = require('../database_connection')();
var scriptHelper = require('./script_helper');

var fail = scriptHelper.fail;
var noErrorOrFilexists = scriptHelper.noErrorOrFilexists;

connection.database('audio-editor-data').create(function(err){
  if(noErrorOrFilexists(err))
    connection.database('audio-editor-users').create(function(err){
      if(noErrorOrFilexists(err))
        console.log('created all databases');
      else
        fail(err);
    });
  else
    fail(err);
});