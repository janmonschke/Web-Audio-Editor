app.controller('RecordingSelectionController', ['$rootScope', '$scope',
  function($rootScope, $scope){

  var close = function(){
    $scope.node = null;
    $scope.buffer = null;
    $scope.showRecordingSelection = false;
  };

  $scope.playSelection = function(){
    $scope.node.play();
  };

  $scope.uploadSelection = function(){
    
  };

  $scope.deleteRecording = function(){

  };

}]);