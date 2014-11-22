app.controller('FileBrowserController', ['$rootScope', '$scope', 'Arrangement', 'FileBrowser',
  function($rootScope, $scope, Arrangement, FileBrowser){

    $rootScope.$on('synced', function(){
      $scope.files = Arrangement.doc.buffers;
    });

    $scope.removeBuffer = function(buffer){
      Arrangement.removeBuffer(buffer);
    };

    $scope.hideFileBrowser = function(){
      FileBrowser.hide();
    };

    $scope.isActiveFile = function(fileName){
      return FileBrowser.activeFileName() == fileName;
    };
}]);