/**
 * Loads a doc from the server and takes care of updating it via differntial synchronization
 */
app.factory('DiffSyncClient', ['$rootScope', 'jsondiffpatch', 'utils', function($rootScope, jsondiffpatch, utils){
  var client = {
    socket: null,
    syncing: false,
    initialized: false,
    scheduled: false,
    doc: {
      localVersion: 0,
      serverVersion: 0,
      shadow: {},
      localCopy: {},
      edits: []
    },
    commands: {
      syncWithServer: 'send-edit',
      getInitialVersion: 'get-latest-document-version',
      remoteUpdateIncoming: 'updated-doc'
    },

    initializeOrSync: function(){
      if(this.isInitialized()){
        window.location.reload();
      }else if(this._id){
        this.getInitialVersion();
      }
    },

    /**
     * Has a sync been scheduled?
     * @return {Boolean}
     */
    isScheduled: function(){
      return this.scheduled === true;
    },

    /**
     * Is client currently syncing?
     * @return {Boolean}
     */
    isSyncing: function(){
      return this.syncing === true;
    },

    /**
     * Has the client been initialized?
     * @return {Boolean}
     */
    isInitialized: function(){
      return this.initialized === true;
    },

    getInitialVersion: function(){
      if(this._id === undefined) throw(new Error('An `id` needs to be specified when syncing a model!'));
      if(this.isSyncing()) return false;
      this.syncing = true;

      this.socket.emit(this.commands.getInitialVersion, this._id, this._setUpLocalVersion.bind(this));
    },

    _setUpLocalVersion: function(latestVersion){
      this.syncing = false;
      this.doc.localCopy = utils.deepCopy(latestVersion.doc);
      this.doc.shadow = utils.deepCopy(latestVersion.doc);
      this.doc.serverVersion = latestVersion.version;
      this.initialized = true;
      $rootScope.$emit('sync');

      // listen to incoming updates from the server
      this.socket.on(this.commands.remoteUpdateIncoming, this.syncWithServer.bind(this));

      // listen to errors and reload
      this.socket.on('error', function(message){
        window.location.reload();
      });
    },

    syncWithServer: function(){
      if(this.isSyncing() || !this.isInitialized()){ return false; }
      this.syncing = true;

      // 1) create a diff of local copy and shadow
      var diff = this.createDiff(utils.deepCopy(this.doc.shadow), utils.deepCopy(this.doc.localCopy));
      var basedOnLocalVersion = this.doc.localVersion;

      // 2) add the difference to the local edits stack if the diff is not empty
      if(!_.isEmpty(diff))
        this.addEdit(diff, basedOnLocalVersion);

      // 3) create an edit message with all relevant version numbers
      var editMessage = this.createEditMessage(basedOnLocalVersion);

      // 4) apply the patch to the local shadow
      this.applyPatchTo(this.doc.shadow, diff);

      // 5) send the edits to the server
      this.sendEdits(editMessage);

      // yes, we're syncing
      return true;
    },

    /**
     * Creates a diff from specified documents
     * @return {Diff}
     */
    createDiff: function(docA, docB){
      return jsondiffpatch.diff(docA, docB);
    },

    /**
     * Applies a given patch (diff) to the given document
     * @param  {Doc} doc the doc that will get patched
     * @param  {Diff} patch the patch
     */
    applyPatchTo: function(doc, patch){
      jsondiffpatch.patch(doc, patch);
    },

    /**
     * Adds an edit to the local edits stack
     */
    addEdit: function(diff, baseVersion){
      this.doc.edits.push({
        serverVersion: this.doc.serverVersion,
        localVersion: baseVersion,
        diff: diff
      });
      // update the local version number
      this.doc.localVersion++;
    },

    createEditMessage: function(baseVersion){
      return {
        id: this.doc.localCopy._id,
        edits: this.doc.edits,
        localVersion: baseVersion,
        serverVersion: this.doc.serverVersion
      }
    },

    /**
     * Sends the edit to the server and processes the server edits
     * @param  {Object} editMessage
     */
    sendEdits: function(editMessage){
      this.socket.emit(this.commands.syncWithServer, editMessage, function(serverEdits){
        this.applyServerEdits(serverEdits);
      }.bind(this));
    },

    applyServerEdits: function(serverEdits){
      if(serverEdits && serverEdits.localVersion == this.doc.localVersion){
        // 0) delete all previous edits
        this.doc.edits = [];
        // 1) iterate over all edits
        serverEdits.edits.forEach(this.applyServerEdit.bind(this));
      }else{
        console.log('rejected patch because localVersions don\'t match');
      }

      this.syncing = false;
      this.scheduled = false;
    },

    applyServerEdit: function(edit){
      // 2) check the version numbers
      if(edit.localVersion == this.doc.localVersion &&
        edit.serverVersion == this.doc.serverVersion){

        // versions match
        // 3) patch the shadow
        this.applyPatchTo(this.doc.shadow, edit.diff);

        // 3) increase the version number for the shadow if diff not empty
        if(!_.isEmpty(edit.diff))
          this.doc.serverVersion++;
        // apply the patch to the local document
        // IMPORTANT: Use a copy of the diff, or newly created objects will be copied by reference!
        this.applyPatchTo(this.doc.localCopy, utils.deepCopy(edit.diff));

        // trigger a generic sync event
        $rootScope.$emit('sync');
      }else{
        console.log('patch from server rejected, due to not matching version numbers');
      }
    },

    /**
     * Schedules a server-sync
     */
    scheduleSync: function(){
      if(this.isScheduled()) return;

      this.scheduled == true;

      this.syncWithServer();
    }

  };

  client.socket = io.connect();
  client.socket.on('connect', client.initializeOrSync.bind(client));

  client.syncWithServer = _.debounce(client.syncWithServer.bind(client), 50);

  // make sure that clients sync at least every 5 seconds
  setInterval(client.scheduleSync.bind(client), 5000);

  window.client = client;
  return client;
}]);