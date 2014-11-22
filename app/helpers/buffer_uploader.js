/**
 * Uploads buffers to the server
 */
app.factory('BufferUploader', ['$q', '$rootScope', 'IDGenerator', function($q, $rootScope, IDGenerator){

  return {
    /**
     * A list of ongoing deferreds
     */
    _deferreds: {},

    /**
     * A list of ongoing requests
     */
    _requests: {},

    /**
     * Checks if the filetype is supported
     */
    supportsUploadOf: function(file){
      return (file.type && (file.type == 'audio/mp3' || file.type == 'audio/wav' || file.type == 'audio/ogg'));
    },

    /**
     * Uploads a file to the specified arrangement
     * @param  {String} arrangementId Id of the arrangement
     * @param  {File} file the file
     * @return {Promise}
     */
    upload: function(arrangementId, file){
      if(!this.supportsUploadOf(file)){
        var deferred = $q.defer();
        deferred.reject('Wrong filetype! ' + file.type);
        return deferred.promise;
      }

      var fileName = file.name;
      if(this._deferreds[fileName])
        return this._deferreds[fileName].promise;
      else
        return this._upload(arrangementId, file);
    },

    _upload: function(arrangementId, file){
      // new deffered for this request
      var fileName = file.name;
      var id = [arrangementId, IDGenerator.generate('buffer'), fileName].join('___');
      var deferred = $q.defer();
      this._deferreds[fileName] = deferred;

      var uploader = this;
      var s3Upload = new S3Upload({
        s3_object_name: id,
        s3_sign_put_url: '/sign_s3',
        onProgress: function(percent, message) {
          console.log('Upload progress: ' + percent + '% ' + message);
          deferred.notify(percent);
        },
        onFinishS3Put: function(public_url) {
          uploader._uploadComplete(public_url, deferred, fileName, id);
          console.log('uploaddone', public_url)
        },
        onError: function(status) {
          console.log('error', 'upload', status)
        }
      });

      s3Upload.uploadFile(file);

      this._requests[fileName] = s3Upload;

      return deferred.promise;
    },

    _uploadComplete: function(url, deferred, fileName, id){
      // delete all cached objects
      delete this._requests[fileName];
      delete this._deferreds[fileName];

      // the newly created buffer object
      var buffer = {
        id: id,
        location: url,
        name: fileName
      };

      $rootScope.$emit('bufferuploader:done');

      deferred.resolve(buffer);
    },

    totalFiles: function(){

    }
  };
}]);