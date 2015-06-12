var appDirectives = angular.module('EventDirectives', []);

appDirectives.directive('xref',function($route, $location){
/* this directive was created to ensure reload of template
   if request same resource. without this as the resource is
   the same it won't go thru the conroller again. useful e.g.
   if browse events and a new event added and reclick browse
   event button, we want to go thru the controler again to
   pick up new event */
  return {
    link: function(scope, elm,attr){
      elm.on('click',function(){
        if ( $location.path() === attr.xref ) {
          $route.reload();
        } else {
          scope.$apply(function(){
            $location.path(attr.xref);
          });
        }
          
                
      });
    }
  };
})
.directive('eventList', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/eventListTable.htm'
  };
});