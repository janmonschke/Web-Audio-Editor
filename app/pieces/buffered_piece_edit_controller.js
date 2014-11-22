app.controller('BufferedPieceEditController', ['$rootScope', '$scope', 'utils', 'EditorConfig', 'Arrangement', 'BufferedRecordingNode',
  function($rootScope, $scope, utils, EditorConfig, Arrangement, BufferedRecordingNode){
    var setupRange = function(){
      // add offsets to buffer if not set
      if($scope.piece.offsetStart == undefined)
        $scope.piece.offsetStart = 0;
      if($scope.piece.offsetEnd == undefined)
        $scope.piece.offsetEnd = 0;

      $scope.leftHandle = ($scope.piece.offsetStart / $scope.node.buffer.duration) * 100;
      $scope.rightHandle = 100 - (($scope.piece.offsetEnd / $scope.node.buffer.duration) * 100);
      $scope.rangeWidth = $scope.node.buffer.duration * EditorConfig.pixelsPerSecond;
    };
    setupRange();

    // if the offsets are changed, set the handles right
    var unwatchOffsetStart = $scope.$watch('piece.offsetStart', setupRange);
    var unwatchOffsetEnd = $scope.$watch('piece.offsetEnd', setupRange);

    var handlesToOffsets = function(){
      return {
        offsetStart: ($scope.node.buffer.duration * $scope.leftHandle) / 100,
        offsetEnd: $scope.node.buffer.duration - (($scope.node.buffer.duration * $scope.rightHandle) / 100)
      }
    };

    var playNode;
    $scope.playSelection = function(){
      if(playNode)
        playNode.stop()
      var handles = handlesToOffsets();

      playNode = new BufferedRecordingNode(utils.deepCopy($scope.piece), $scope.node.buffer);
      playNode.data.offsetStart = handles.offsetStart;
      playNode.data.offsetEnd = handles.offsetEnd;
      playNode.play();
    };

    $scope.applySelection = function(){
      var handles = handlesToOffsets();
      $scope.piece.offsetStart = handles.offsetStart;
      $scope.piece.offsetEnd = handles.offsetEnd;
    };

    $scope.tearDown = function(){
      if(playNode)
        playNode.stop()
      unwatchOffsetStart();
      unwatchOffsetEnd();
    };
}]);