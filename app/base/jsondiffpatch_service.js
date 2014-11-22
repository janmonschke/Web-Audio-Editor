app.factory('jsondiffpatch', [function(){
  jsondiffpatch.config.objectHash = function(obj) { return obj.id || JSON.stringify(obj); };
  return jsondiffpatch;
}]);