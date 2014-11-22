app.directive('editorTrack', ['$rootScope', '$compile', 'EditorConfig', 'Arrangement',
  function($rootScope, $compile, EditorConfig, Arrangement) {

  return {
    restrict: 'E',
    controller: 'EditorTrackController',
    templateUrl: 'editor/track.html',
    link: function(scope, element, attrs){
      var trackElement = element[0].querySelector('.track');

      trackElement.addEventListener('dragenter', function(event){
        trackElement.classList.add('drop-here')
        event.preventDefault()
        event.stopPropagation();
        return false;
      });

      trackElement.addEventListener('dragover', function(event){
        trackElement.classList.add('drop-here')
        event.preventDefault()
        event.stopPropagation();
        return false;
      });

      trackElement.addEventListener('dragleave', function(event){
        trackElement.classList.remove('drop-here');
        event.preventDefault()
        event.stopPropagation();
        return false;
      });

      trackElement.addEventListener('drop', function(event){
        trackElement.classList.remove('drop-here');

        // calculate the current position in the track from the drop event
        var position = (event.x - EditorConfig.track_settings_offset) / EditorConfig.pixelsPerSecond;

        var bufferId = event.dataTransfer.getData('buffer_id');

        // if a bufferId has been set, we don't need to upload
        if(bufferId){
          scope.addBuffer(bufferId, position);
        }else{
          // upload the dropped files
          scope.uploadFile(event.dataTransfer.files.item(0), position);
        }

        event.preventDefault();
        event.stopPropagation();
        return false;
      });

      var getAdditionalContentElement = function(){
        return angular.element(
          document.getElementById('additional-content-' + scope.track.id)
        );
      };

      // compile and render a directive into the additional content div (e.g. a recording view)
      scope.addAdditionalContent = function(directiveHTML, theScope){
        var newElement = $compile(directiveHTML)(theScope);
        var container = scope.removeAdditionalContent();
        var additionalContentControls =
          '<div class="additional-content-controls"><button class="topcoat-button" ng-click="removeAdditionalContent()">close</button></div>';
        var additionalContentControls = $compile(additionalContentControls)(theScope);
        container.append(newElement);
        container.append(additionalContentControls);
      };

      // remove the additional content from the view (e.g. a recording view)
      scope.removeAdditionalContent = function(){
        var addContent = getAdditionalContentElement();
        addContent.html('');
        return addContent;
      };
    }
  }
}]);