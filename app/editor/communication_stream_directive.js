app.directive('communicationStream', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      scope.session.subscribe(scope.stream, element[0]);

      element.on('click', function(){
        var currentIdex = scope.streams.indexOf(scope.stream);
        scope.streams[currentIdex] = scope.streams[0];
        scope.streams[0] = scope.stream;
        console.log(currentIdex)
        scope.$apply();
      })
    }
  }
});