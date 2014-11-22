app.directive('drumPieceEdit', ['$compile', 'EditorConfig',
    function($compile, EditorConfig) {

  return {
    restrict: 'A',
    templateUrl: 'pieces/drum_piece_edit.html',
    controller: 'DrumPieceEditController',
    link: function(scope, element, attrs){

      // add the pattern name when one of the buttons is dragged
      element[0].querySelector('.pattern-container').addEventListener('dragstart', function(event){
        var patternName = event.target.attributes['data-pattern-name'].value;
        event.dataTransfer.setData('patternName', patternName);
      });

      var partsOrderContainer = element[0].querySelector('.parts-order-container')

      partsOrderContainer.addEventListener('dragover', function(event){
        partsOrderContainer.classList.add('drop-here');
        event.preventDefault()
        event.stopPropagation();
        return false;
      });

      partsOrderContainer.addEventListener('dragleave', function(event){
        partsOrderContainer.classList.add('drop-here');
      });

      // react to dropped patterns
      partsOrderContainer.addEventListener('drop', function(event){
        partsOrderContainer.classList.remove('drop-here');
        var patternName = event.dataTransfer.getData('patternName');

        if(patternName){
          scope.$apply(function(){
            scope.piece.patternOrder.push(patternName);
          });
        }
      });

      element.on('$destroy', function(){
        console.log('destory all watchers')
        scope.tearDown();
      });
    }
  }
}]);