app.service('FileBrowser', ['$rootScope', function($rootScope){
  var showFileBrowser = false;
  var activeFile = '';

  return {
    show: function(){
      showFileBrowser = true;
    },

    setActiveFile: function(fileName){
      activeFile = fileName;
    },

    hide: function(){
      showFileBrowser = false;
      activeFile = '';
    },

    isVisible: function(){
      return showFileBrowser == true;
    },

    activeFileName: function(){
      return activeFile;
    }
  }
}]);