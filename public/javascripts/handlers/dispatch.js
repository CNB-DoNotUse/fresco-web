/// <reference path="../../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />

var PAGE_Dispatch = {
	enabled: $('.assignments-panel').length > 0,
	
	createTitle: $('#add-assignment-title'),
	createCaption: $('#add-assignment-description'),
	createLocation: $('#add-assignment-location-input'),
	createRadius: $('#add-assignment-radius-input'),
	createExpiration: $('#add-assignment-expiration'),
	createSubmit: $('#add-assignment-submit'),
	// getAssignments: function(callback){
	// 	$.ajax(API_URL + "/v1/assignment/getAll", {
	// 		success: function(result){
	// 			if(result.err)
	// 				return callback(result.err, null);
					
	// 			return callback(null, result.data);
	// 		},
	// 		error: function(xhr, status, error){
	// 			return callback(error, null);
	// 		}
	// 	});
	// },
	getExpiredAssignments: function(offset, limit, callback){
		if (!PAGE_Dispatch.enabled) return callback(null, []);
		
		$.ajax("/scripts/assignment/expired", {
			data: {
				offset: offset,
				limit: limit
			},
			success: function(result){
				if(result.err){
					return callback(result.err, null);
				}
				result.data = result.data.map(function(a){
					a.posts = a.posts.filter(function(b){return b.approvals > 0;});
					return a;
				});
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	},
	
	findAssignments: function(map, callback){
		if (!PAGE_Dispatch.enabled) return callback(null, []);
		
		var bounds = map.getBounds();
		var sw = bounds.getSouthWest(); 
		var ne = bounds.getNorthEast();
		var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (sw, ne);
		var proximitymiles = proximitymeter * 0.000621371192;
		var radius = proximitymiles / 2;
		var center = map.getCenter();
		
		var query = "lat=" + center.lat() + "&lon=" + center.lng() + "&radius=" + radius;
			
			$.ajax("/scripts/assignment/getAll?" + query, {
				success: function(result){
					if(result.err){
						return callback(result.err, null);
					}
					
					result.data = result.data.map(function(a){
						a.posts = a.posts.filter(function(b){return b.approvals > 0;});
						return a;
					});
					
					return callback(null, result.data);
				},
				error: function(xhr, status, error){
					return callback(error, null);
				}
			});
	},
	
	addAssignment: function(assignment, callback){
		if (!PAGE_Dispatch.enabled) return callback(null, {});
		
		$.ajax({
			url: "/scripts/assignment/create",
			contentType: 'application/json',
			data: JSON.stringify(assignment),
			method: 'POST',
			success: function(result){
				if (result.err) return callback(result.err, null);
				
				result.data.posts.filter(function(a){return a.approvals > 0;});
				
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		})
	},
	
	getFirstPost: function(assignment, callback){
		if(!assignment.posts || assignment.posts.length === 0){
			return callback('/images/placeholder-assignment.png');
		}
		PAGE_Dispatch.getPost(assignment.posts[0], function(err, post) {
			if(err) return callback('/images/placeholder-assignment.png');
			return callback(formatImg(post.image, 'small'));
		});
	},
	
	getAllPosts: function(assignment, callback){
		$.ajax("/scripts/assignment/get",{
			data: {id: assignment._id},
			method: 'GET',
			success: function(result){
				if (result.err) return callback(result.err, null);
				return callback(null, result.data.posts.filter(function(a){return a.approvals > 0;}));
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	},
	
	getPost: function(id, callback){
		$.ajax(API_URL + "/v1/post/get?id=" + id + "&stories=true&caption=true", {
			success: function(result){
				if(result.err) return callback(result.err, null);
				callback(null, result.data);
			},
			error: function(xhr, status, error){
				callback(error, null);
			}
		});
	},
	
	findUsers: function(map, callback){
		var bounds = map.getBounds();
		
		if (!bounds)
			callback(null, []);
		
		var sw = bounds.getSouthWest(); 
		var ne = bounds.getNorthEast();
		var proximitymeter = google.maps.geometry.spherical.computeDistanceBetween (sw, ne);
		var proximitymiles = proximitymeter * 0.000621371192;
		var radius = proximitymiles / 2;
		var center = map.getCenter();
		
		PAGE_Dispatch.findUsersCenterRadius(center, radius, callback);
	},
	findUsersCenterRadius: function(center, radius, callback){
		var query = "lat=" + center.lat() + "&lon=" + center.lng() + "&radius=" + radius;
			
		$.ajax(API_URL + "/v1/user/findInRadius?" + query, {
			success: function(result){
				if(result.err){
					return callback(result.err, null);
				}
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	},
	makeMarker: function(map, position, title, status, draggable){
		var markerURL = '/images/assignment-active@2x.png';
		var zIndex = 300;
		if (status == 'pending') {
			markerURL = '/images/assignment-pending@2x.png';
			zIndex = 200;
		}
		else if (status == 'expired'){
			markerURL = '/images/assignment-expired@2x.png';
			zIndex = 100
		}
		
		var image = {
			url: markerURL,
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};
		
		return new google.maps.Marker({
			position: position,
			map: map,
			title: title,
			icon: image,
			zIndex: zIndex,
			draggable: draggable
		});
	},

	makeUserMarker: function(map, position){
		var image = {
			url: "/images/assignment-user@2x.png",
			size: new google.maps.Size(70, 70),
			scaledSize: new google.maps.Size(30, 30),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(15, 15),
		};
		
		return new google.maps.Marker({
			position: position,
			map: map,
			icon: image,
			zIndex: 0,
			clickable: false
		});
	},

	makeCircle: function(map, center, radius, status){
		var fillColor = '#ffc600';
		if (status == 'pending') {
			fillColor = '#d8d8d8';
		}
		else if (status == 'expired'){
			fillColor = '#d0021b';
		}
		
		return new google.maps.Circle({
			map: map,
			center: center,
			radius: radius,
	
			strokeWeight: 0,
			fillColor: fillColor,
			fillOpacity: 0.26
		});
	},
	infoWindow: null,
	focusOnAssignment: function(assignment){		
		var lat = assignment.location.geo.coordinates[1];
		var lng = assignment.location.geo.coordinates[0];
		
		var circle = PAGE_Dispatch.makeCircle(null, new google.maps.LatLng(lat, lng), milesToMeters(assignment.location.radius), status);
		
		PAGE_Dispatch.map.fitBounds(circle.getBounds());
		
		if(PAGE_Dispatch.infoWindow) PAGE_Dispatch.infoWindow.close();
		
		var caption = assignment.caption;
		if(caption.length >= 140){
			caption = caption.substr(0, 137);
			caption += "&hellip;";
		}
		
		var elem = $('<div class="callout">' +
			'	<div class="assignment-callout-main">' +
			'		<div class="md-type-body2 assignment-callout-title">' + assignment.title + '</div>' +
			'		<div class="md-type-body1 assignment-callout-caption">' + caption + '</div>' +
			'		<div class="assignment-callout-buttons">' +
			'			<span class="mdi mdi-file-image-box icon assignment-callout-icon"></span>' +
			'			<span class="assignment-callout-image-counter">0</span>' +
			'			<span class="mdi mdi-movie icon assignment-callout-icon"></span>' +
			'			<span class="assignment-callout-video-counter">0</span>' +
			'			<button type="button" class="btn btn-flat assignment-callout-button pull-right">See All<div class="ripple-wrapper"></div></button>' +
			'		</div>' +
			'	</div>' +
			'</div>');
		
		PAGE_Dispatch.getAllPosts(assignment, function(err, posts){
			if(err){
				console.log(err);
				return;
			}
			
			if (posts.length > 0) {
				var img = $('<img class="img-cover assignment-callout-img" src="' + posts[0].image + '"></img>')
				elem.prepend(img);
			}
			
			//elem.find('.assignment-callout-img').attr('src', posts[0].image);
			var imageCounter = 0;
			var videoCounter = 0;
			
			posts.forEach(function(post){
				if (post.approvals == 0)
					return;
				
				if(post.video) 	videoCounter += 1;
				else			imageCounter += 1;
			});
			elem.find('.assignment-callout-image-counter').text(imageCounter);
			elem.find('.assignment-callout-video-counter').text(videoCounter);
		});
		
		elem.find('.assignment-callout-button').click(function() {
			window.location.assign('/assignment/' + assignment._id);
		});
		
		PAGE_Dispatch.infoWindow = new google.maps.InfoWindow({
			content: elem.get(0),
			position: new google.maps.LatLng(lat, lng),
		});
		
		PAGE_Dispatch.infoWindow.open(PAGE_Dispatch.map);
	},
	
	checkForUsers: function(radius) {
		radius = ((PAGE_Dispatch.assignmentMap.circle.getRadius() || 0) * 0.000621371192) + 15 //Convert to miles, add 15
		PAGE_Dispatch.findUsersCenterRadius(PAGE_Dispatch.assignmentMap.circle.getCenter(), radius, function(err, users){
			if(!users || users.length < 3) {
				$.snackbar({content: "There aren't that many users around here. It could take a while to get coverage."});
			}
		});
	},
	
	/*
	Main map
	*/
	map: null,
	showExpired: false,
	initialize: function(){
		$('#active-button, #pending-button').click(function(){
			if(PAGE_Dispatch.showExpired){
				PAGE_Dispatch.showExpired = false;
				refreshMap();
			}
		});
		$('#history-button').click(function(){
			if(!PAGE_Dispatch.showExpired){
				PAGE_Dispatch.showExpired = true;
				refreshMap();
			}
		});
	
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];
	
		if(!window.sessionStorage.dispatch){
			window.sessionStorage.dispatch = JSON.stringify({
				map_center: {lat: 40.7, lng: -74},
				map_zoom: 12
			});
		}
	
		var savedViewport = JSON.parse(window.sessionStorage.dispatch);
	
		var mapOptions = {
			center: savedViewport.map_center,
			zoom: savedViewport.map_zoom,
			// mapTypeControl: true,
		    // mapTypeControlOptions: {
		    //     position: google.maps.ControlPosition.LEFT_CENTER,
		    // },
			styles: styles
		};
		PAGE_Dispatch.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		var assignmentsOnMap = [];
		PAGE_Dispatch.usersOnMap = [];
	
		google.maps.event.addListener(PAGE_Dispatch.map, 'idle', refreshMap);
	
		// google.maps.event.addListener(PAGE_Dispatch.map, 'idle', function(){
		// 	if(!PAGE_Dispatch.initialToggle){
		// 		PAGE_Dispatch.assignmentMap.panTo(PAGE_Dispatch.map.getCenter());
		// 	}
		// });
	
		var geocoder = new google.maps.Geocoder();
		google.maps.event.addListener(PAGE_Dispatch.map, 'click', function(ev){
			if(!PAGE_Dispatch.initialToggle){
				var oldLocation = PAGE_Dispatch.assignmentMap.marker.getPosition();
				
				PAGE_Dispatch.assignmentMap.panTo(ev.latLng);
				PAGE_Dispatch.assignmentMap.marker.setPosition(ev.latLng);
				PAGE_Dispatch.assignmentMap.circle.setCenter(ev.latLng);
				PAGE_Dispatch.map.marker.setPosition(ev.latLng);
				PAGE_Dispatch.map.circle.setCenter(ev.latLng);
				if(!(PAGE_Dispatch.assignmentMap.circle.getRadius() >= 100)){
					PAGE_Dispatch.assignmentMap.setZoom(12);
				}
				else{
					PAGE_Dispatch.assignmentMap.fitBounds(PAGE_Dispatch.assignmentMap.circle.getBounds());
				}
				geocoder.geocode({'location': ev.latLng}, function(results, status){
					if(status === google.maps.GeocoderStatus.OK && results[0]) {
						PAGE_Dispatch.createLocation.val(results[0].formatted_address).trigger('keyup');
					}
				});
				if(google.maps.geometry.spherical.computeDistanceBetween(oldLocation, ev.latLng) > 5000){
					PAGE_Dispatch.checkForUsers(PAGE_Dispatch.assignmentMap.circle.getRadius() || 0);
				}
			}
		})
	
		setInterval(refreshMap, 10000);
	
		var historyLoading = false;
		var historyOffset = 0;
		$('#history-list').scroll(function(){
			if(!historyLoading && $('#history-list')[0].scrollHeight - $('#history-list').scrollTop() <= $('#history-list').height() + 64)
				loadHistory();
		});
		function loadHistory(){
			if (historyLoading) {
				return;
			}
			historyLoading = true;
			
			PAGE_Dispatch.getExpiredAssignments(historyOffset, 10, function(err, assignments){
				//$('#history-list').empty();
				if (err)
					console.log('Error getting expired assignments: ' + JSON.stringify(err));
	
				if(!assignments) return;
				
				assignments.forEach(function(assignment){
					var elem = makeAssignmentListItem(assignment);
					// var lat = assignment.location.geo.coordinates[1];
					// var lng = assignment.location.geo.coordinates[0];
					// var circle = PAGE_Dispatch.makeCircle(null, new google.maps.LatLng(lat, lng), milesToMeters(assignment.location.radius));
					elem.on('click', function(){
						// map.fitBounds(circle.getBounds());
						// window.location.assign('/assignment/' + assignment._id);
						PAGE_Dispatch.focusOnAssignment(assignment);
					});
					$('#history-list').append(elem);
					historyOffset += 1;
				});
				
				historyLoading = false;
			});
		}
	
		loadHistory();
	
		function refreshMap(){
			var viewport = {
				map_center: {lat: PAGE_Dispatch.map.getCenter().lat(), lng: PAGE_Dispatch.map.getCenter().lng()},
				map_zoom: PAGE_Dispatch.map.getZoom()
			}
			window.sessionStorage.dispatch = JSON.stringify(viewport);
			
			PAGE_Dispatch.findUsers(PAGE_Dispatch.map, function(err, users){
				if(err) return console.log(err);
				PAGE_Dispatch.usersOnMap.forEach(function(user) {
					user.map.marker.setMap(null);
				}, this);
				PAGE_Dispatch.usersOnMap.length = 0;
				
				users.forEach(function(user){
					var lat = user.coordinates[1];
					var lng = user.coordinates[0];
					
					var marker = PAGE_Dispatch.makeUserMarker(PAGE_Dispatch.map, new google.maps.LatLng(lat, lng));
					
					user.map = {};
					user.map.marker = marker;
					
					PAGE_Dispatch.usersOnMap.push(user);
				});
			});
			
			PAGE_Dispatch.findAssignments(PAGE_Dispatch.map, function(err, assignments){
				$('#active-list').empty();
				$('#pending-list').empty();
				
				assignments.forEach(function(assignment){
					makeAssignmentListItem(assignment, function(elem){
						var status = 'active';
						if(assignment.visibility == 0)
							status = 'pending';
						if (assignment.expiration_time && assignment.expiration_time < Date.now()){
							if(PAGE_Dispatch.showExpired)
								status = 'expired';
							else
								return;	
						}
						if(assignment.visibility == -1)
							return;
						// elem.on('click', function(){
						// 	window.location.assign('/assignment?id=' + assignment._id);
						// });
						if(status == 'active'){
							$('#active-list').append(elem);
						}
						else if(status == 'pending') {
							$('#pending-list').append(elem);
						}
					});
				});
				
				if (!assignments) return;
				
				assignments = assignments.filter(function(assignment) {
					return assignmentsOnMap.filter(function(assign2){ return assignment._id == assign2._id}).length === 0;
				});
				
				assignmentsOnMap = assignmentsOnMap.filter(function(assignment){
					var toDelete = assignments.filter(function(assign2){ return assignment._id == assign2._id}).length !== 0;
					
					if (assignment.expiration_time && assignment.expiration_time < Date.now() && !PAGE_Dispatch.showExpired)
							toDelete = true;
					
					if (toDelete){
						assignment.map.marker.setMap(null);
						assignment.map.circle.setMap(null);
						return false;
					}
					return true;
				});
				
				// assignmentsOnMap.forEach(function(assignment) {
				// 	assignment.map.marker.setMap(null);
				// 	assignment.map.circle.setMap(null);
				// }, this);
				// assignmentsOnMap.length = 0;
				
				assignments.forEach(function(assignment){
					var lat = assignment.location.geo.coordinates[1];
					var lng = assignment.location.geo.coordinates[0];
					
					var status = 'active';
					if(assignment.visibility == 0)
						status = 'pending';
					if (assignment.expiration_time && assignment.expiration_time < Date.now()){
						if(PAGE_Dispatch.showExpired)
							status = 'expired';
						else
							return;	
					}
					
					if(assignment.visibility == -1)
						return;
						
					var marker = PAGE_Dispatch.makeMarker(PAGE_Dispatch.map, new google.maps.LatLng(lat, lng), assignment.title, status);
					var circle = PAGE_Dispatch.makeCircle(PAGE_Dispatch.map, new google.maps.LatLng(lat, lng), milesToMeters(assignment.location.radius), status);
					
					assignment.map = {};
					assignment.map.marker = marker;
					assignment.map.circle = circle;
	
					google.maps.event.addListener(marker, 'click', function(){
						PAGE_Dispatch.focusOnAssignment(assignment);
						//PAGE_Dispatch.map.fitBounds(circle.getBounds());
					});
					
					assignmentsOnMap.push(assignment);
				});
			});
		};
	
		function makeAssignmentListItem(assignment, callback){
			var expTimeStr = 'Expires ' + moment(assignment.expiration_time, 'x').fromNow();
			if (!assignment.expiration_time) {
				expTimeStr = 'Never Expires';
			}
			else {
				var relative = moment(assignment.expiration_time, 'x').fromNow();
				if (assignment.expiration_time < Date.now())
					expTimeStr = "Expired " + relative;
				else
					expTimeStr = "Expires " + relative;
			}
			var locationStr = assignment.location.googlemaps;
			if (!assignment.location.googlemaps) {
				locationStr = "Unknown";
			}
	
			var imageUrl = '/images/placeholder-assignment.png';
	
			var elemText = '<div class="list-item">' +
				'<div>' +
					'<img class="img-circle" src="' + imageUrl + '">' +
				'</div>' +
				'<div class="flexy">' +
					'<span class="md-type-body2">' + assignment.title + '</span>' +
					'<span class="md-type-caption md-type-black-secondary">' + locationStr + ' &bull; ' + expTimeStr + '</span>' +
				'</div>' +
			'</div>';
			var elem = $(elemText);
			elem.data('id', assignment._id);
			elem.click(function(){
				// window.location.assign('/assignment/' + assignment._id);
				PAGE_Dispatch.focusOnAssignment(assignment);
			});
			PAGE_Dispatch.getFirstPost(assignment, function(image){
				elem.find('.img-circle').attr("src", image);
				if(callback) callback(elem);
			});
			return elem;
		};
		var autocomplete = new google.maps.places.Autocomplete(document.getElementById('navbar-location-input'));
		
		google.maps.event.addListener(autocomplete, 'place_changed', function(){
			var place = autocomplete.getPlace();
			
			if(place.geometry){
				if(place.geometry.viewport)
					PAGE_Dispatch.map.fitBounds(place.geometry.viewport);
				else{
					PAGE_Dispatch.map.panTo(place.geometry.location);
					PAGE_Dispatch.map.setZoom(18);
				}
			}
			else
				console.log("incorrect place");
		});
	},
	
	/*
	Add assignment map
	*/
	assignmentMap: null,
	initialToggle: true,
	assignmentToggled: function() {
		if (!PAGE_Dispatch.initialToggle) {
			return;
		}
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];
		
		var assignmentMapOptions = {
			center: PAGE_Dispatch.map.getCenter(),
			zoom: 12,
			mapTypeControl: false,
			styles: styles,
			disableDefaultUI: true,
			draggable: false,
			zoomControl: false,
			scrollwheel: false,
			disableDoubleClickZoom: true
		};
		PAGE_Dispatch.assignmentMap = new google.maps.Map(document.getElementById('add-assignment-map'), assignmentMapOptions);
		
		PAGE_Dispatch.assignmentMap.marker = PAGE_Dispatch.makeMarker(PAGE_Dispatch.assignmentMap, PAGE_Dispatch.assignmentMap.getCenter(), "New Assignment");
		PAGE_Dispatch.assignmentMap.circle = PAGE_Dispatch.makeCircle(PAGE_Dispatch.assignmentMap, PAGE_Dispatch.assignmentMap.getCenter(), feetToMeters(parseInt(PAGE_Dispatch.createRadius.val())));
		
		setUpMainMap();
		
		$('#open-assignment-window').click(function(){
			setUpMainMap();
		});
		$('#close-assignment-window').click(function(){
			PAGE_Dispatch.map.marker.setMap(null);
			PAGE_Dispatch.map.circle.setMap(null);
		});
		
		var geocoder = new google.maps.Geocoder();
		function setUpMainMap(){
			PAGE_Dispatch.map.marker = PAGE_Dispatch.makeMarker(PAGE_Dispatch.map, PAGE_Dispatch.assignmentMap.getCenter(), "New Assignment", 'active', true);
			PAGE_Dispatch.map.circle = PAGE_Dispatch.makeCircle(PAGE_Dispatch.map, PAGE_Dispatch.assignmentMap.getCenter(), feetToMeters(parseInt(PAGE_Dispatch.createRadius.val())));
			var oldLocation;
			google.maps.event.addListener(PAGE_Dispatch.map.marker, 'dragstart', function(ev){
				oldLocation = ev.latLng;
			});
			google.maps.event.addListener(PAGE_Dispatch.map.marker, 'drag', function(ev){
				PAGE_Dispatch.assignmentMap.marker.setPosition(ev.latLng);
				PAGE_Dispatch.assignmentMap.circle.setCenter(ev.latLng);
				PAGE_Dispatch.assignmentMap.setCenter(ev.latLng);
				PAGE_Dispatch.map.circle.setCenter(ev.latLng);
			});
			google.maps.event.addListener(PAGE_Dispatch.map.marker, 'dragend', function(ev){
				geocoder.geocode({'location': ev.latLng}, function(results, status){
					if(status === google.maps.GeocoderStatus.OK && results[0]) {
						PAGE_Dispatch.createLocation.val(results[0].formatted_address).trigger('keyup');
					}
				});
				if(google.maps.geometry.spherical.computeDistanceBetween(oldLocation, ev.latLng) > 5000){
					PAGE_Dispatch.checkForUsers(PAGE_Dispatch.assignmentMap.circle.getRadius() || 0);
				}
			});
		}
		
		// google.maps.event.addListener(PAGE_Dispatch.assignmentMap, 'center_changed', function() {
		// 	marker.setPosition(PAGE_Dispatch.assignmentMap.getCenter());
		// 	circle.setCenter(PAGE_Dispatch.assignmentMap.getCenter());
		// });
		
		PAGE_Dispatch.createRadius.on('change', function(){
			var newRadius = parseInt($(this).val());
			if(isNaN(newRadius)) return;
			PAGE_Dispatch.assignmentMap.circle.setRadius(feetToMeters(newRadius));
			PAGE_Dispatch.map.circle.setRadius(feetToMeters(newRadius));
			if(newRadius >= 100){
				PAGE_Dispatch.assignmentMap.fitBounds(PAGE_Dispatch.assignmentMap.circle.getBounds());
				PAGE_Dispatch.map.fitBounds(PAGE_Dispatch.assignmentMap.circle.getBounds());
			}
			else {
				PAGE_Dispatch.assignmentMap.panTo(PAGE_Dispatch.assignmentMap.circle.getCenter());
				PAGE_Dispatch.assignmentMap.setZoom(18);
				PAGE_Dispatch.map.panTo(PAGE_Dispatch.assignmentMap.circle.getCenter());
				PAGE_Dispatch.map.setZoom(18);
			}
		});
		
		var autocomplete = new google.maps.places.Autocomplete(document.getElementById('add-assignment-location-input'));
		PAGE_Dispatch.createLocation.attr('placeholder', '');
		
		google.maps.event.addListener(autocomplete, 'place_changed', function(){
			var place = autocomplete.getPlace();
			if(place.geometry){
				PAGE_Dispatch.assignmentMap.marker.setPosition(place.geometry.location);
				PAGE_Dispatch.assignmentMap.circle.setCenter(place.geometry.location);
				PAGE_Dispatch.map.marker.setPosition(place.geometry.location);
				PAGE_Dispatch.map.circle.setCenter(place.geometry.location);
				
				if(place.geometry.viewport && PAGE_Dispatch.assignmentMap.circle.getRadius() === 0){
					PAGE_Dispatch.assignmentMap.fitBounds(place.geometry.viewport);
					PAGE_Dispatch.map.fitBounds(place.geometry.viewport);
				}
				else{
					PAGE_Dispatch.assignmentMap.panTo(place.geometry.location);
					PAGE_Dispatch.map.panTo(place.geometry.location);
					if(PAGE_Dispatch.assignmentMap.circle.getRadius() <= 100){
						PAGE_Dispatch.assignmentMap.setZoom(17);
						PAGE_Dispatch.map.setZoom(18);
					}
					else{
						PAGE_Dispatch.assignmentMap.fitBounds(PAGE_Dispatch.assignmentMap.circle.getBounds());
						PAGE_Dispatch.map.fitBounds(PAGE_Dispatch.assignmentMap.circle.getBounds());
					}
				}
			}
			else{
				console.log("incorrect place");
			}
			PAGE_Dispatch.checkForUsers(PAGE_Dispatch.assignmentMap.circle.getRadius() || 0);
		});
		
		PAGE_Dispatch.createSubmit.on('click', function(e){
			var place = autocomplete.getPlace(),
				assignment = {
					title: PAGE_Dispatch.createTitle.val(),
					caption: PAGE_Dispatch.createCaption.val(),
					lat: PAGE_Dispatch.assignmentMap.marker.getPosition().lat(),
					lon: PAGE_Dispatch.assignmentMap.marker.getPosition().lng(),
					radius: parseInt(PAGE_Dispatch.createRadius.val()),
					expiration_time: parseInt(PAGE_Dispatch.createExpiration.val()),
					outlet : (PAGE_Dispatch.outlet ? PAGE_Dispatch.outlet._id : ""),
					// googlemaps: googlemaps.locality + ", " + googlemaps.administrative_area_level_1,
					googlemaps: PAGE_Dispatch.createLocation.val(),
					address: place ? place.formatted_address : null,
			};
		
			if (assignment.title === ''){
				$.snackbar({content: 'Assignment must have a title'});
				e.stopImmediatePropagation();
				return false;
			}
			if (assignment.caption === ''){
				$.snackbar({content: 'Assignment must have a caption'});
				e.stopImmediatePropagation();
				return false;
			}
			if (assignment.googlemaps === ''){
				$.snackbar({content: 'Assignment must have a location'});
				e.stopImmediatePropagation();
				return false;
			}
			if (isNaN(assignment.expiration_time) || assignment.expiration_time < 1){
				$.snackbar({content: 'Expiration time must be at least 1 hour'});
				e.stopImmediatePropagation();
				return false;
			}
			if (isNaN(assignment.radius) || assignment.radius < 250)
				assignment.radius = 250;
				
			assignment.radius = feetToMiles(assignment.radius);
			assignment.expiration_time *= 3600000;
			
			PAGE_Dispatch.addAssignment(assignment, function(err, assignment){
				if (err)
					return $.snackbar({content:resolveError(err)});
				
				PAGE_Dispatch.map.marker.setMap(null);
				PAGE_Dispatch.map.circle.setMap(null);
				
				PAGE_Dispatch.map.panTo(PAGE_Dispatch.assignmentMap.marker.getPosition());
				PAGE_Dispatch.map.setZoom(PAGE_Dispatch.assignmentMap.getZoom());
			});
		});
		
		PAGE_Dispatch.initialToggle = false;
	}
};

$(function(){
	google.maps.event.addDomListener(window, 'load', PAGE_Dispatch.initialize);
	
	if (PAGE_Dispatch.enabled) $('.card-body input, .card-body textarea').on('change textInput input', function(e){
		if (PAGE_Dispatch.createTitle.val() === '' || 
			PAGE_Dispatch.createCaption.val() === '' || 
			PAGE_Dispatch.createLocation.val() === '' || 
			isNaN(parseInt(PAGE_Dispatch.createRadius.val())) ||
			isNaN(PAGE_Dispatch.createRadius.val()) || 
			!PAGE_Dispatch.createExpiration.val() ||
			isNaN(PAGE_Dispatch.createExpiration.val()) ||
			parseInt(PAGE_Dispatch.createExpiration.val()) < 1){
			return PAGE_Dispatch.createSubmit.attr('disabled', true);
		}
		
		PAGE_Dispatch.createSubmit.attr('disabled', false);
	});
	else $('#request-dispatch-submit').on('click', function(e){
		var _this = $(this);
		_this.prop('disabled', true);
		
		$.ajax({
			url: '/scripts/outlet/dispatch/request',
			contentType: 'application/json',
			data: JSON.stringify({ comment: $('#request-access-comment').val() }),
			method: 'POST',
			success: function(result){
				if (result.err)
					return this.error(null, null, result.err);
				
				$('#request-access-comment').val('')
				$.snackbar({content: 'Your request to access Fresco Dispatch has been sent!  We will be in touch soon!'});
			},
			error: function(xhr, status, error){
				e.preventDefault();
				$.snackbar({content: resolveError(error, 'There was an error processing your request, please wait and try again.')});
			},
			complete: function(){
				_this.prop('disabled', false);
			}
		});
	});
	
	$(".toggle-card.toggler").click(function() {
		$(".toggle-card").toggleClass("toggled");
		$(".cards").animate({ scrollTop: $(".cards")[0].scrollHeight}, 300);
		if (PAGE_Dispatch.enabled) PAGE_Dispatch.assignmentToggled();
	});
});