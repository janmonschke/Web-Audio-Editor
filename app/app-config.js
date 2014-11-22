app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.when('/arrangement/:id', {
    templateUrl: 'editor/editor.html'
  });
}]);