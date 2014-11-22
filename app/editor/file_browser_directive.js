app.directive('fileBrowser', function() {
  return {
    restrict: 'A',
    controller: 'FileBrowserController',
    templateUrl: 'editor/file-browser.html',
    link: function(scope, element, attr){

      // one of the draggable elements is being dragged
      element[0].addEventListener('dragstart', function(event){
        var bufferId = event.target.attributes['data-buffer-id'].value;
        event.dataTransfer.setData('buffer_id', bufferId);
      });
    }
  }
});