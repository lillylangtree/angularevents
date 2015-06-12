
var app= angular.module('eventapp', ['EventControllers','EventServices','EventDirectives','firebase','ngRoute'
]);
//Define Routing for app
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
        .when('/', {
          templateUrl: 'templates/home.htm'
		})
		.when('/viewEvents', {
          templateUrl: 'templates/events.htm'
		})
		.when('/viewEvents/:subscriber', {
          templateUrl: 'templates/events.htm'
		})
		.when('/admin', {
          templateUrl: 'templates/admin.htm'
		})
		/*
		.when('/location', {
          templateUrl: 'templates/location.htm',
          controller: 'locationController'
		})
		.when('/about', {
          templateUrl: 'templates/about.htm',
          controller: 'aboutController'
		})
		.when('/error/:errormessage', {
          templateUrl: 'templates/error.htm',
          controller: 'errorController'
		})*/
		
}]);