var io = require('socket.io');
var _  = require('underscore');
var jsondiffpatch = require('jsondiffpatch');

var Arrangement = require('./models/arrangement');

// configure the synchronization module
module.exports = function(server){
  io = io.listen(server);
  io.set('log level', 1);

  // handle new socket connection
  io.sockets.on('connection', handleSocket);
};

// set up object comparison
jsondiffpatch.config.objectHash = function(obj) { return obj.id || JSON.stringify(obj); };

// utility function for deep object copying
var deepCopy = function(obj){
  return JSON.parse(JSON.stringify(obj));
};

var handledDocuments = {};

var docFromId = function(id, cb){
  if(handledDocuments[id])
    cb(handledDocuments[id]);
  else
    Arrangement.get(id).then(function(arrangement){
      delete arrangement._rev;

      // don't override if created in meantime
      if(!handledDocuments[id])
        handledDocuments[id] = {
          registeredSockets: [],
          clientVersions: {},
          serverCopy: arrangement
        };

      cb(handledDocuments[id])
    });
};

var registerSocketFor = function(id, socket){
  docFromId(id, function(doc){
    doc.registeredSockets.push(socket);
  });
};

var sendServerChanges = function(doc, clientDoc, socket, send){
  // create a diff from the current server version to the client's shadow
  var diff = jsondiffpatch.diff(clientDoc.shadow.doc, doc.serverCopy);
  var basedOnServerVersion = clientDoc.shadow.serverVersion

  // add the difference to the server's edit stack
  if(!_.isEmpty(diff)){
    clientDoc.edits.push({
      serverVersion: basedOnServerVersion,
      localVersion: clientDoc.shadow.localVersion,
      diff: diff
    });
    // update the server version
    clientDoc.shadow.serverVersion++;
  }

  // apply the patch to the server shadow
  jsondiffpatch.patch(clientDoc.shadow.doc, diff);

  send({
    localVersion: clientDoc.shadow.localVersion,
    serverVersion: basedOnServerVersion,
    edits: clientDoc.edits
  });
};

var sendCurrentServerVersion = function(id, socketId, send){
  docFromId(id, function(doc){
    var baseDoc = doc.serverCopy;

    doc.clientVersions[socketId] = {
      backup: {
        doc: deepCopy(baseDoc),
        serverVersion: 0
      },
      shadow: {
        doc: deepCopy(baseDoc),
        serverVersion: 0,
        localVersion: 0
      },
      edits: []
    };

    send({
      doc: baseDoc,
      version: 0
    });
  });
};

var registerSocketFor = function(id, socket, cb){
  docFromId(id, function(doc){
    doc.registeredSockets.push(socket);
    cb();
  });
};

var receiveEdit = function(clientEdit, socket, send){
  // 0) get the relevant doc
  docFromId(clientEdit.id, function(doc){
    // 0.a) get the client versions
    var clientDoc = doc.clientVersions[socket.id];

    if(!clientDoc){
      console.log('error', 'Need to re-authenticate');
      socket.emit('error', 'Need to re-authenticate.');
      return;
    }

    // when the versions match, remove old edits stack
    if(clientEdit.serverVersion == clientDoc.shadow.serverVersion)
      clientDoc.edits = [];

    console.log(socket.id, clientEdit.serverVersion, clientDoc.shadow.serverVersion, 'amount of edits:', clientEdit.edits.length);

    // 1) iterate over all edits
    clientEdit.edits.forEach(function(edit){
      // 2) check the version numbers
      if(edit.serverVersion == clientDoc.shadow.serverVersion &&
        edit.localVersion == clientDoc.shadow.localVersion){
        // versions match
        // backup! TODO: is this the right place to do that?
        clientDoc.backup = deepCopy(clientDoc.shadow);
        // 3) patch the shadow
        var snapshot = deepCopy(clientDoc.shadow.doc);
        jsondiffpatch.patch(snapshot, edit.diff);
        clientDoc.shadow.doc = snapshot;
        // apply the patch to the server's document
        snapshot = deepCopy(doc.serverCopy);
        jsondiffpatch.patch(snapshot, edit.diff);
        doc.serverCopy = snapshot;

        // 3.a) increase the version number for the shadow if diff not empty
        if(!_.isEmpty(edit.diff)){
          clientDoc.shadow.localVersion++;
          // notify all sockets about the update, all but this one
          doc.registeredSockets.forEach(function(soc){
            if(soc.id != socket.id){
              soc.emit('updated-doc');
            }
          });
        }

        // 4) save a snapshot of the document
        saveSnapshot(clientEdit.id);
      }else{

        console.log('error', 'patch rejected!!', edit.serverVersion, '->', clientDoc.shadow.serverVersion, ':',
                    edit.localVersion, '->', clientDoc.shadow.localVersion);

      }
    });

    sendServerChanges(doc, clientDoc, socket, send);
  });
}

var disconnectSocketFromDocs = function(socket){
  // iterateo over all documents
  for(var id in handledDocuments){
    var doc = handledDocuments[id];
    // check if current socket is listed for this doc and remove it
    var index = doc.registeredSockets.indexOf(socket);
    if(index >= 0)
      if(doc.registeredSockets.length === 1)
        doc.registeredSockets = []
      else
        doc.registeredSockets = doc.registeredSockets.slice(index, index + 1);

    // if it was the last connected socket, delete the document from the cache
    // but first save it once more
    if(doc.registeredSockets.length === 0){
      saveSnapshot(id);
    }
  }
};

var handleSocket = function(socket){
  socket.on('get-latest-document-version', function(docId, send) {
    registerSocketFor(docId, socket, function(){
      sendCurrentServerVersion(docId, socket.id, send);
    });
  });

  socket.on('send-edit', function(clientEdit, send){
    receiveEdit(clientEdit, socket, send);
  });

  socket.on('disconnect', function(){
    disconnectSocketFromDocs(socket);
  });
};

var saveSnapshot = function(id){
  docFromId(id, function(doc){
    save(doc.serverCopy);
  });
};

var save = function(doc){
  Arrangement.save(doc);
};
save = _.debounce(save, 1000);

//
var sendCurrentServerVersion = function(id, socketId, send){
  docFromId(id, function(doc){
    var baseDoc = doc.serverCopy;

    doc.clientVersions[socketId] = {
      backup: {
        doc: deepCopy(baseDoc),
        serverVersion: 0
      },
      shadow: {
        doc: deepCopy(baseDoc),
        serverVersion: 0,
        localVersion: 0
      },
      edits: []
    };

    send({
      doc: baseDoc,
      version: 0
    });
  });
};