var appControllers = angular.module('EventControllers', [ ]);

appControllers.controller("HomeController",['$scope','$rootScope','$location', function($scope,$rootScope,$location) {
        console.log("in home controller");
		/*
		$rootScope.credentials = {};
		$rootScope.loggedIn=false;*/
}]);

appControllers.controller("AdminController",['$scope','$rootScope','$location', function($scope,$rootScope,$location) {

	var ref = new Firebase("https://locationserver.firebaseio.com");
	$rootScope.isAdmin = false;
	$scope.authCtrl = {};
	$scope.authCtrl.error = false;
	$rootScope.credentials = {};
	 $scope.authCtrl.user = {
      email: '',
      password: ''
    };
	/*ref.createUser({
	  email    : "sean@nmm.ie",
	  password : "angularjsworkshop"
	}, function(error, userData) { 
		if (error) {
			console.log("Error creating user:", error);
		  } else {
			console.log("Successfully created user account with uid:", userData.uid);
		  }
	});*/
	$scope.authCtrl.login = function() {
			ref.authWithPassword({
				email    : $scope.authCtrl.user.email,
				password : $scope.authCtrl.user.password
				}, function(error, authData) {
				  if (error) {
					$scope.authCtrl.error = true
					$scope.authCtrl.error.message = error
				  } else {
					console.log("Authenticated successfully with payload:", authData);
					$scope.$apply(function() {  
						$rootScope.isAdmin = true;
						$rootScope.credentials = {};
						$location.url('/');
						});
				  }
				});
		}
}]);

appControllers.controller("LoginController",['$scope','$rootScope','UserService', function($scope,$rootScope,UserService) {
			
			console.log("in login controller");
			$scope.loginFacebook = function() {
				var ref = new Firebase("https://locationserver.firebaseio.com");
				ref.authWithOAuthPopup("facebook", function(error, authData) {
					  if (error) {
						alert("Facebook Login Failed! " + error);
					  } else {
					    $rootScope.credentials = {};
						console.log("Authenticated successfully with payload:", authData);
						$scope.$apply(function() {          
							 /**
							 * Using $scope.$apply since this happens outside angular framework.
							 */
							$rootScope.credentials.name = authData.facebook.displayName;
							$rootScope.credentials.email = authData.facebook.email;
							$rootScope.credentials.userId = authData.facebook.id;
							
							UserService.get($rootScope.credentials).then(
								function(data) {
									if (data == null)
										$rootScope.user = UserService.save($rootScope.credentials.userId,$rootScope.credentials);
									else
										$rootScope.user = data;
									$rootScope.isAdmin=false;	
									$rootScope.loggedIn=true;
									},
								function(error) {
								  console.log('error Failed getting user: ' + error.message );
								}			
							);								
						 });
					  }
					}, {
					  remember: "sessionOnly",
					  scope: "email"
					});
				};
}]);

appControllers.controller("EventController",['$scope','$rootScope','EventService','UserService','SubscriptionService','$q','$routeParams',
							function($scope,$rootScope,EventService,UserService,SubscriptionService,$q,$routeParams) {
               				
	function createEventListDisplayObject(value,key) {
		value.eventObject.id = key; /* add event id to display object */
		value.eventObject.subscribed = false;
		if ($rootScope.user) {
			if ($rootScope.user.event) {
				if ($rootScope.user.event[key]) /*check if user subscribed event */
					value.eventObject.subscribed = true;
			}
		}
		return value.eventObject;
	}
	function getAllEvents() {
		$scope.events = [];
		console.log("in get events");
		EventService.get().then(
				function(data) {
					var eventList = [];
					console.log("retreiving events from firebase");
					if (data != null) {
						angular.forEach(data, function(value,key){											
							eventList.push(createEventListDisplayObject(value,key));
						});
					}
					$scope.events = eventList
					},
				function(error) {
				  console.log(' error Failed getting all events: ' + error.message );
				}			
		);	
	};	
	
	function getUserEvents(){
		$scope.new = false;
		$scope.show = false;
		$scope.selection = 'list';
		if ($rootScope.user) {
			if ($rootScope.user.event) {
				SubscriptionService.userEvents($rootScope.user.event).then(function(data) {
					$scope.events=data;
				},
				function(error) {
				  console.log(' error Failed getting user event: ' + error.message ); /* modal alert and reroute */
				}	
				);
				
			}
		}
	}
	console.log("in Events Controller");
	$scope.myForm = {};
	$scope.new = false;
	$scope.show = false;
	if ($routeParams.subscriber)
		getUserEvents(); /* get user subscribed events */
	else
		getAllEvents();
							
	$scope.allEvents = function(){
		$scope.new = false;
		$scope.show = false;
		$scope.selection = 'list';
		getAllEvents();
		}
	
	$scope.subscribeEvent = function(event) {				
		if ($rootScope.loggedIn) {
			$rootScope.user = SubscriptionService.addEvent($rootScope.user,event);
			event.subscribed = true;					
			}
		else {
			alert("not logged in");
			}
	}
	$scope.unSubscribeEvent = function(event) {				
		if ($rootScope.loggedIn) {
			$rootScope.user = SubscriptionService.removeEvent($rootScope.user,event);
			event.subscribed = false; 			
			}
		else {
			alert("not logged in");
			}
	}
	$scope.newEvent = function(){
		$scope.new = true;
		$scope.myForm = {};
		$scope.selection = 'new'
	}
		
	$scope.detailsEvent = function(event) {
		$scope.new = true;
		$scope.show = true;
		$scope.myForm = event;
		$scope.selection = 'details';
		$scope.location = event.location.split(' ').join('+'); /* scope.map */
		$scope.zoom = 14;										/* scope.map */
		$scope.myForm.subscribed = false;
		if ($rootScope.user) {
			if ($rootScope.user.event) {
				if($rootScope.user.event[event.id])
					$scope.myForm.subscribed = true;
			}
		}
					
	}
	$scope.editEvent = function(event) { /*isAdmin */
		$scope.new = true;
		$scope.show = false;
		$scope.myForm = event;
		$scope.selection = 'edit';
	}
	$scope.updateEvent = function(event) {/*isAdmin */
	   EventService.update(event); /* check return code */
	   getAllEvents();
	   $scope.new = false;
	   $scope.selection = 'list';
	}
	$scope.deleteEvent = function(event) {/*isAdmin */
	   EventService.delete(event); /* check return code */
	   getAllEvents();
	   $scope.new = false;
	   $scope.selection = 'list';
	}			
	$scope.submitTheForm = function() {
	   console.log('Submitting form');
	   if (!$scope.eventForm.$invalid) {
		   var eventObject = {
			  startdate : $scope.myForm.startdate
			  ,enddate  : $scope.myForm.enddate
			  ,title  : $scope.myForm.title
			  ,description  : $scope.myForm.description
			  ,location  : $scope.myForm.location
			  
		   }
		   EventService.save(eventObject).then(function(data) {
					getAllEvents();
					$scope.new = false;
					$scope.selection = 'list';
					return true
				},
				function(error) {
					  console.log(' error Failed saving event: ' + error.message ); /* modal alert and reroute */
					  $scope.myForm={};
					  return false;
				})
				.finally(function(res){ console.log("in finally save event" + res)});	   
		}
		console.log("end of submit");
	}
}]);
appControllers.controller("MapController",['$scope', function($scope) {

	$scope.zoom = $scope.$parent.zoom;
	$scope.location = $scope.$parent.location;
	
	$scope.zoomIn = function() {		
		$scope.zoom++
	}
	$scope.zoomOut = function() {		
		$scope.zoom--
	}
	
}]);