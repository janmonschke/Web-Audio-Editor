app.directive('bufferedPieceEdit', ['$compile', 'EditorConfig',
    function($compile, EditorConfig) {

  return {
    restrict: 'A',
    templateUrl: 'pieces/buffered_piece_edit.html',
    controller: 'BufferedPieceEditController',
    link: function(scope, element, attrs){
      // set the curtain width
      var applyCurtainWidth = function(){
        angular.element(element[0].querySelector('.curtain')).css('width', scope.rangeWidth + 'px')
      };
      var unwatchRangeWidth = scope.$watch('rangeWidth', applyCurtainWidth);

      var leftCurtain = angular.element(element[0].querySelector('.curtain .left'));
      var applyLeftCurtain = function(){
        var width = (scope.leftHandle / 100) * scope.rangeWidth;
        leftCurtain.css('width', width + 'px');
      }
      var unwatchLeftHandle = scope.$watch('leftHandle', applyLeftCurtain);

      var rightCurtain = angular.element(element[0].querySelector('.curtain .right'));
      var applyRightCurtain = function(){
        var width = (1 - (scope.rightHandle / 100)) * scope.rangeWidth;
        rightCurtain.css('width', width + 'px');
      };
      var unwatchRightHandle = scope.$watch('rightHandle', applyRightCurtain);

      element.on('$destroy', function(){
        unwatchRangeWidth();
        unwatchLeftHandle();
        unwatchRightHandle();
        scope.tearDown();
      });
    }
  }
}]);