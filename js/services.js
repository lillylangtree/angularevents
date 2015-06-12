var appServices = angular.module('EventServices', []);

appServices.factory('SubscriptionService', function ($q,EventService) {
		  var dbref = new Firebase("https://locationserver.firebaseio.com/eventDB/users");
		  return {
		  
				addEvent: function (user,event) {
						/* save the user with the facebook id as the key */
						userRef = dbref.child(user.userId);
						if (!user.event)
							user.event = {}
							
						user.event[event.id] = true
						/*var userEventRef = userRef.child('event');*/
						userRef.update(user);
						return user;
						
				},
				userEvents: function (userEvent) {
					var deferred = $q.defer();      
					var defs = [];
					var promises = [];

					var i=0;
					var length = Object.keys(userEvent).length;

					for(var j=0; j<length; ++j) {
						defs[j] = $q.defer();
						promises[j] = defs[j].promise;
					}
					angular.forEach(userEvent, function(value,key){
						EventService.getEvent(key).then(
						function(data) {
							data.eventObject.id = key; /* add event id to display object */
							data.eventObject.subscribed = true;
							console.log("watched changed " + key);
							defs[i].resolve(data.eventObject);
							i++;
							},
						function(error) {
						  console.log(' error ** Failed getting user event: ' + error.message );
						}		
					);
					console.log("next subscribed");
					});
					console.log("finished: subscribed list");
					$q.all(promises).then(function(datas) {
						deferred.resolve(datas);
					});
					return deferred.promise;
				},
				removeEvent: function (user,event) {
					/* save the user with the facebook id as the key */
					userRef = dbref.child(user.userId);
					if (!user.event)
						alert("error: no events to remove");
						
					delete user.event[event.id]
					/*var userEventRef = userRef.child('event');*/
					userRef.update(user);
					return user;					
				}		  
		  	}
		}
	);

	appServices.factory('UserService', function ($q) {
		  var dbref = new Firebase("https://locationserver.firebaseio.com/eventDB/users");
		  return {
				/* Try to create a user for facebook id, but only if the user doesn't exisit
				var userRef = new Firebase('https://locationserver.firebaseio.com/eventDB/users/'+id);
				userRef.transaction(function(currentData) {
				  if (currentData === null) {
					return currentData;
				  } else {
					console.log('User  already exists.');
					return; // Abort the transaction.
				  }
				}, function(error, committed, snapshot) {
				  if (error) {
					console.log('Transaction failed abnormally!', error);
				  } else if (!committed) {
					console.log('We aborted the transaction (because user already exists).');
				  } else {
					console.log('User  added!');
				  }
				  console.log("user data: ", snapshot.val());
				}); */
			save: function (id,userObject) {
			    /* save the user with the facebook id as the key */
				var key = id;
				var saveUserObj = {};
				userObject.events = {};
				saveUserObj[key] = userObject;
				dbref.set( saveUserObj);			  
				return saveUserObj;
			  }
			,
			get: function (userObject) {			 
			  var userRef = dbref.child(userObject.userId);	
			  var deferred = $q.defer();
			      userRef.on("value", function(user) {
					  console.log(user.val());
					  deferred.resolve(user.val());
					});
				return deferred.promise;
			  }
		
		}
		}
	);
	
appServices.factory('EventService', function ($q) {
		  var ref = new Firebase("https://locationserver.firebaseio.com/eventDB");
		  return {
			save: function (eventObject) {
				  var deferred = $q.defer();
			      eventObject.added = Firebase.ServerValue.TIMESTAMP;
				  var addedDate = new Date(eventObject.added*1000);
				  console.log("added date " + addedDate.toJSON());
			      var eventsRef = ref.child("events");
				  eventsRef.push({eventObject}, function (error) {
						if (error) {
							console.log("The save event failed: " + error.code);
							deferred.reject({message: "The save event failed: " + error.code});
							}
						else
							deferred.resolve(eventObject);
						}
				  );				  				  
				  return deferred.promise;
			  },
			delete: function (deleteObject) {
				  var dbref = new Firebase("https://locationserver.firebaseio.com/eventDB/events");
				  var eventRef = dbref.child(deleteObject.id);			  
				  eventRef.remove();			      			  
				  return 'ok';
			  },
			update: function (updateObject) {
				  var dbref = new Firebase("https://locationserver.firebaseio.com/eventDB/events");
				  var eventRef = dbref.child(updateObject.id).child('eventObject');
				  var eventObject = {
					  startdate : updateObject.startdate
					  ,enddate  : updateObject.enddate
					  ,title  : updateObject.title
					  ,description  : updateObject.description
					  ,location  : updateObject.location
					  
				   }
				   eventObject.added = Firebase.ServerValue.TIMESTAMP;
				   eventRef.update(eventObject);			      			  
				   return 'ok';
			  },
			  get: function () {
                  /* because .on is an async call we need to use a deferred
                     promise to return the values from the database. when we
                     call this function in our controller we will use .then
                     to retrieve the data when the async call has completed */
				  var dbref = new Firebase("https://locationserver.firebaseio.com/eventDB/events");
				  var deferred = $q.defer();
			      dbref.on("value", function(events) {
					  console.log(events.val());
					  deferred.resolve(events.val());
					}, function (error) {
						console.log("The read events failed: " + error.code);
						deferred.reject({message: "The read events failed: " + error.code});
						}
					);
				return deferred.promise;
			  },			  	  			
			  getEvent: function (eventId) {	
				  var eventsRef = new Firebase("https://locationserver.firebaseio.com/eventDB/events");
				  var eventRef = eventsRef.child(eventId);	
				  var deferred = $q.defer();
					  eventRef.on("value", function(event) {					
						  deferred.resolve(event.val());
						}, function (error) {
							console.log("The get events failed: " + error.code);
							deferred.reject({message: "The get events failed: " + error.code});
						}
						);
					return deferred.promise;
			  }
			}
		});