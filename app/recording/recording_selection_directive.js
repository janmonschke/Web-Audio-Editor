app.directive('recordingSelection', ['$rootScope', '$compile', 'EditorConfig', 'Arrangement',
  function($rootScope, $compile, EditorConfig, Arrangement) {

  return {
    restrict: 'A',
    controller: 'RecordingSelectionController',
    templateUrl: 'recording/recording-selection.html'
  }
}]);