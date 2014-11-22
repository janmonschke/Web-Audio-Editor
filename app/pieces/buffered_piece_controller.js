app.controller('BufferedPieceController', ['$rootScope', '$scope', 'BufferedNode', 'Arrangement',
  function($rootScope, $scope, BufferedNode, Arrangement){

  $scope.node = new BufferedNode($scope.piece);
  Arrangement.registerPiece($scope.node.data.id, $scope.node);

  $scope.node.master = $scope.trackNode.in;
  $scope.node.context = $scope.trackNode.context;

  $scope.edit = function(){
    $scope.addAdditionalContent('<div buffered-piece-edit class="buffered-piece-edit-container"></div>', $scope);
  };

  $scope.remove = function(){
    Arrangement.removePieceFromTrack($scope.piece, $scope.track);
    $scope.node.stop();
  };

  var unwatchChange = $scope.$watch('piece.position', function(a,b){
    if(a != b)
      $scope.node.stop();
  });
}]);