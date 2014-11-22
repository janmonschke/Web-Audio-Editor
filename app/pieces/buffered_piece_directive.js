app.directive('bufferedPiece', ['$compile', 'EditorConfig', 'Arrangement', 'utils', 'IDGenerator',
    function($compile, EditorConfig, Arrangement, utils, IDGenerator) {

  return {
    restrict: 'E',
    templateUrl: 'pieces/buffered_piece.html',
    controller: 'BufferedPieceController',
    link: function(scope, element, attrs){
      scope.copyPiece = function(event){
        if(!event.shiftKey) return;
        var copiedPiece = utils.deepCopy(scope.piece);
        copiedPiece.position += .2;
        copiedPiece.id = IDGenerator.generate('piece');
        scope.track.pieces.push(copiedPiece);
      }
    }
  }
}]);