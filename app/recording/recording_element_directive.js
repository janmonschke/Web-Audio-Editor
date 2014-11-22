app.directive('recordingElement', function() {
  return {
    restrict: 'A',
    templateUrl: 'recording/recording-element.html',
    controller: 'RecordingController'
  }
});