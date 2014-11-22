app.directive('draggableEditorElement', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr){

      var dragStart = function(event){
        // only allow left clicks
        if(event.which != 1) return

        angular.element(document).one('mouseup', dragend);
        angular.element(document).bind('mousemove', drag);

        scope.lastX = scope.startX = event.x;
        scope.lastY = scope.startY = event.y;

        element.triggerHandler('drag-start');
      };

      var drag = function(event){
        event.preventDefault();
        event.stopPropagation();

        scope.currentX = event.x;
        var xDiff = scope.currentX - scope.lastX;
        scope.currentY = event.y;
        var yDiff = scope.currentY - scope.lastY;

        // Somehow the last drag event has weird numbers and causes glitches
        // By disallowing a max drag diff, we can prevent the glitches
        // if(Math.abs(xDiff) < 200){
          scope.lastX = scope.currentX;
          scope.dragXDiff = scope.currentX - scope.startX;
          scope.lastY = scope.currentY;
          scope.dragYDiff = scope.currentY - scope.startY;

          element.triggerHandler('drag', [xDiff, yDiff]);
        // }

        return false;
      };

      var dragend = function(event){
        event.stopPropagation();
        event.preventDefault();

        element.triggerHandler('drag-end');

        angular.element(document).unbind('mousemove', drag);

        return false;
      };

      element.bind('mousedown', dragStart);
    }
  }
});