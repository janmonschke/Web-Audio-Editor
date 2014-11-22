app.directive('beatsGrid', ['$compile', 'EditorConfig', 'Drumkits',
    function($compile, EditorConfig, Drumkits) {

  var assignInstruments = function(scope){
    scope.instruments = Drumkits.instrumentsForKit(scope.piece.drumType);
  };

  return {
    restrict: 'A',
    templateUrl: 'pieces/beats_grid.html',
    link: function(scope, element, attrs){
      assignInstruments(scope);

      scope.changeBeat = function(instrument, index, oldValue){
        var instrument = scope.node[scope.currentPatternName].data.beats[instrument];
        instrument[index] = (oldValue == 1) ? 0 : 1;
      };

      var unwatchPatternChange = scope.$watch('piece.drumType', function(){
        assignInstruments(scope);
      });

      element.on('$destroy', function(){
        unwatchPatternChange();
      });
    }
  }
}]);