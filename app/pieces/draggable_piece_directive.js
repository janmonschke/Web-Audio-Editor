app.directive('draggablePiece', ['$rootScope', 'EditorConfig', function($rootScope, EditorConfig) {

  var updatePosition = function(scope, element, position){
    var modelPosition = scope.tone? scope.tone.position : scope.piece.position;
    position = position != undefined ? position : modelPosition * EditorConfig.pixelsPerSecond;
    element.css('left', position + 'px');
  };

  return {
    restrict: 'A',
    link: function(scope, element, attrs){

      // save the current position when draggint starts
      element.on('drag-start', function(){
        scope.currentLeft = parseInt(element.css('left').replace('px', ''), 10);
      });

      // move to the updated position when dragging
      element.on('drag', function(event, xDiff, yDiff){
        scope.currentLeft += xDiff
        updatePosition(scope, element, scope.currentLeft);
      });

      // save the updated position
      element.on('drag-end', function(){
        var newPos = parseInt(element.css('left').replace('px', ''), 10) / EditorConfig.pixelsPerSecond;
        newPos = Math.max(0, newPos);
        scope.$apply(function(){
          if(scope.tone){
            scope.tone.position = newPos;
          }else if(scope.piece){
            scope.piece.position = newPos;
            $rootScope.$emit('unschedule', scope.piece);
          }

          // also: manually trigger the re-positioning
          // the visual state could be at -7sec, the new position would be normalized to 0
          // so no chang in model state
          updatePosition(scope, element);
        });
      });

      // either watch the current piece's position or another specified value
      // if this value changes, update the visual position
      scope.$watch(attrs.position || 'piece.position', function(){
        updatePosition(scope, element);
      }, true)

      scope.$watch('config.pixelsPerSecond', function(){
        updatePosition(scope, element);
      });

      updatePosition(scope, element);
    }
  }
}])