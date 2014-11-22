app.directive('contenteditable', function(){
  return {
    require: 'ngModel',
    link: function(scope, element, attributes, controller) {
      element.bind('keydown', function(event){
        // ENTER
        if(event.keyCode === 13){
          element[0].blur();
        }
      })

      // read and save the value when the element blurs
      element.bind('blur', function() {
        scope.$apply(function() {
          controller.$setViewValue(element.text().replace(/(\r\n|\n|\r)/gm, ""));
        });
      });
    }
  };
});