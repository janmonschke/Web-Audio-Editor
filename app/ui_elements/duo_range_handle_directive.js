app.directive('duoRangeHandle', ['$compile', 'EditorConfig',
    function($compile, EditorConfig) {

  var constraintsFulfilled = function(scope, myHandle, newValue){
    if(myHandle == 'right')
      return (newValue > scope.leftHandle);
    else
      return (newValue < scope.rightHandle);
  };

  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      var myHandleValue = attrs.duoRangeHandle + 'Handle';
      var otherHandleValue = (attrs.duoRangeHandle == 'right') ? 'leftHandle' : 'rightHandle';

      var setPosition = function(){
        var handleValue = scope[myHandleValue];
        if(handleValue != undefined)
          element.css('left', handleValue + '%');
      };

      setPosition();

      scope.$watch(myHandleValue, setPosition);

      // move to the updated position when dragging
      element.on('drag', function(event, xDiff, yDiff){
        event.preventDefault();
        event.stopPropagation();

        var newValue = scope[myHandleValue] + (xDiff * EditorConfig.pixelsPerSecond) / scope.rangeWidth;

        if(newValue >= 0 && newValue <= 100 && constraintsFulfilled(scope, attrs.duoRangeHandle, newValue))
          scope.$apply(function(){
            scope[myHandleValue] = newValue
          });

        return false;
      });
    }
  }
}]);