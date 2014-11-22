app.controller('CommunicationPanelController', ['$rootScope', '$scope', 'Arrangement', '$http',
  function($rootScope, $scope, Arrangement, $http){
    $scope.apiKey = undefined; //TOKBOX API KEY
    if(!$scope.apiKey) console.error('You need to specifiy a tokbox api key in order to enable video chat');

    $scope.sessionDetails = null;
    $scope.streams = [];

    $scope.$watch('showCommunicationPanel', function(newV, oldV){
      if(newV === false && oldV === true)
        $scope.stopCommunication();
      else if(newV === true)
        $scope.startCommunication();
    });

    $scope.hideCommunicationPanel = function(){
      $rootScope.showCommunicationPanel = false;
    };

    $scope.startCommunication = function(){
      if($scope.sessionDetails == null)
        $http.get('/arrangement/' + Arrangement.doc._id + '/webrtc_session').then(function(session){
          $scope.sessionDetails = session.data;
          $scope.startSession();
        });
      else
        $scope.startSession();
    };

    $scope.stopCommunication = function(){
      $scope.sessionDetails = null;
      $scope.publisher = null;
      $scope.streams = [];
      if($scope.session){
        $scope.session.disconnect();
        $scope.session = null;
      }
    };

    $scope.startSession = function(){
      var session = TB.initSession($scope.sessionDetails.session_id);
      $scope.session = session;

      // add the user's session
      session.on('sessionConnected', function(event){
        $scope.publisher = true;
        var publisher = TB.initPublisher($scope.apiKey);
        $scope.session.publish(publisher);

        for(var i = 0; i < event.streams.length; i++) {
          var ids = _.pluck($scope.streams, 'id');
          var connections = _.pluck($scope.streams, 'connection');
          var connection_ids = _.pluck(connections, 'connectionId');
          console.log(event.streams[i].id, 'wants to connect to (id)', ids);
          console.log(event.streams[i].connection.connectionId, 'wants to connect to (connectionId)', connection_ids);
          var idIndex = ids.indexOf(event.streams[i].id);
          var connIdIndex = connection_ids.indexOf(event.streams[i].connection.connectionId);
          if(event.streams[i].connection.connectionId != session.connection.connectionId && idIndex == -1 && connIdIndex == -1){
            $scope.streams.push(event.streams[i]);
          }
        }
        $scope.$apply();
      });

      // add the stream when another one is created
      session.on('streamCreated', function(event){
        for(var i = 0; i < event.streams.length; i++) {
          var ids = _.pluck($scope.streams, 'id');
          var connections = _.pluck($scope.streams, 'connection');
          var connection_ids = _.pluck(connections, 'connectionId');
          console.log(event.streams[i].id, 'wants to connect to (id)', ids);
          console.log(event.streams[i].connection.connectionId, 'wants to connect to (connectionId)', connection_ids);
          var idIndex = ids.indexOf(event.streams[i].id);
          var connIdIndex = connection_ids.indexOf(event.streams[i].connection.connectionId);
          if(event.streams[i].connection.connectionId != session.connection.connectionId && idIndex == -1 && connIdIndex == -1){
            $scope.streams.push(event.streams[i]);
          }
        }
        $scope.$apply();
      });

      // remove the stream when it's being destroyed
      session.on('streamDestroyed', function(event){
        for(var i = 0; i < event.streams.length; i++) {
          var index = $scope.streams.indexOf(event.streams[i]);
          if(index != -1){
            $scope.streams.splice(index, 1)
          }
        };
        $scope.$apply();
      });

      // connect to the session
      session.connect($scope.apiKey, $scope.sessionDetails.token);
    };

}]);