app.directive('communicationPublisher', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      var publisher = TB.initPublisher(scope.apiKey, element[0]);
      scope.session.publish(publisher);
    }
  }
});