app.controller('EditorControlsController', ['$rootScope', '$scope', 'Scheduler', 'Arrangement', 'FileBrowser',
  function($rootScope, $scope, Scheduler, Arrangement, FileBrowser){
    $rootScope.showCommunicationPanel = false;

    $scope.playing = false;
    $scope.arrangement = Arrangement.doc;
    $scope.gain = 1;

    $scope.isPlaying = function(){
      return ($scope.playing ? 'icon-pause' : 'icon-play');
    };

    $scope.playPause = function(){
      if($scope.playing)
        this.pause();
      else
        this.play();
    };

    $scope.play = function(){
      $scope.playing = true;
      Scheduler.start();
    };

    $scope.pause = function(){
      $scope.playing = false;
      Scheduler.pause();
    };

    $scope.stop = function(){
      $scope.playing = false;
      $rootScope.$emit('stop');
      Scheduler.stop();
    };

    $scope.addTrack = function(type){
      $scope.showMenu = false;
      Arrangement.addTrack(type);
    };

    $scope.showFiles = function(){
      FileBrowser.show();
    };

    $scope.hideFiles = function(){
      FileBrowser.hide();
    };

    $scope.isFileBrowserVisible = function(){
      return FileBrowser.isVisible();
    };

    $scope.showCommunication = function(){
      $rootScope.showCommunicationPanel = true;
    };

    $scope.isCommunicationPanelVisible = function(){
      return $rootScope.showCommunicationPanel === true;
    };

    // update the gain in the audio node when it changes
    $scope.$watch('gain',function(){
      Arrangement.master.gain.value = $scope.gain;
    });

    // unschedule piece by request
    $rootScope.$on('force-stop', function(event){
      $scope.stop();
    });
}]);