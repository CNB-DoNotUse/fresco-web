/* global posts */
var PAGE_Assignment = {
	filter: 'verified',
	sort_key: 'time_created',

	//Edit assignment variables
	initialAssignmentToggle: true,
	assignmentMarker: null,
	assignmentCircle: null,
	assignmentMap: null,
	assignmentAutocomplete: null,
	
	
	
	refreshList: function(){
		$('#posts').empty();
		var visiblePosts = PAGE_Assignment.posts.filter(function(post){
			if(PAGE_Assignment.filter == 'all') return true;
			return post.approvals > 0;
		});
		visiblePosts.sort(function(a, b){
			if(a[PAGE_Assignment.sort_key] > b[PAGE_Assignment.sort_key]) return 1;
			if(a[PAGE_Assignment.sort_key] < b[PAGE_Assignment.sort_key]) return -1;
			return 0;
		});
		visiblePosts.reverse();
		if (visiblePosts.length === 0) {
			$('#posts').append($('<p></br>No posts yet!</p>'));
		}
		visiblePosts.forEach(function(post){
			var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', true);
			$('#posts').append(elem);
		});
	},
	
	updateAssignment: function(params, callback){
		$.ajax({
			url: "/scripts/assignment/update",
			contentType: 'application/json',
			data: JSON.stringify(params),
			method: 'POST',
			success: function(result){
				if (result.err) return callback(result.err, null);
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	},

	assignmentSave: function(){
		var place = PAGE_Assignment.assignmentAutocomplete.getPlace(),
			params = {
				id: PAGE_Assignment.assignment._id,
				lat: PAGE_Assignment.assignmentMarker.getPosition().lat(),
				lon: PAGE_Assignment.assignmentMarker.getPosition().lng(),
				expiration_time: parseInt($('#assignment-expiration-input').val()),
				googlemaps: $('#assignment-location-input').val(),
				address: place ? place.formatted_address : null,
				title: $('#assignment-title-input').val(),
				caption: $('#assignment-description-input').val(),
				radius: parseInt($('#assignment-radius-input').val())
		}
		
		if (params.title === ''){
			$.snackbar({content: 'Assignment must have a title'});
			return false;
		}
		if (params.caption === ''){
			$.snackbar({content: 'Assignment must have a caption'});
			return false;
		}
		if (params.googlemaps === ''){
			$.snackbar({content: 'Assignment must have a location'});
			return false;
		}
		if (isNaN(params.radius) || params.radius < 150){
			$.snackbar({content: 'Radius must be at least 150ft'});
			return false;
		}
		if (isNaN(params.expiration_time) || params.expiration_time == 0){
			$.snackbar({content: 'Expiration time must be a number greater than 0'});
			return false;
		}
		params.radius = feetToMiles(params.radius);
		params.expiration_time *= 3600000;
		
		PAGE_Assignment.updateAssignment(params, function(err, newAssignment){
			if (!err)
				window.location.reload();
		});
	},
	
	assignmentUpdate: function(){
		if (PAGE_Assignment.initialAssignmentToggle) {
			PAGE_Assignment.initialAssignmentToggle = false;
			var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
				{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
				{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
				{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
				{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
				{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
				{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];
			
			var mapOptions = {
				center: {lat: 40.7, lng: -74},
				zoom: 12,
				mapTypeControl: false,
				styles: styles
			};
			
			PAGE_Assignment.assignmentMap = new google.maps.Map(document.getElementById('assignment-map-canvas'), mapOptions);
			
			var image = {
				url: "/images/assignment-active@2x.png",
				size: new google.maps.Size(114, 114),
				scaledSize: new google.maps.Size(60, 60),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(30, 30)
			};
			
			PAGE_Assignment.assignmentMarker = new google.maps.Marker({
				position: new google.maps.LatLng(40.7, -74),
				map: PAGE_Assignment.assignmentMap,
				icon: image
			});
			
			PAGE_Assignment.assignmentCircle = new google.maps.Circle({
				map: PAGE_Assignment.assignmentMap,
				center: new google.maps.LatLng(40.7, -74),
				radius: 1,
		
				strokeWeight: 0,
				fillColor: '#ffc600',
				fillOpacity: 0.26
			});
			
			PAGE_Assignment.assignmentAutocomplete = new google.maps.places.Autocomplete(document.getElementById('assignment-location-input'));
			$('#assignment-location-input').attr('placeholder', '');
			google.maps.event.addListener(PAGE_Assignment.assignmentAutocomplete, 'place_changed', function(){
				var place = PAGE_Assignment.assignmentAutocomplete.getPlace();
				if(place.geometry){
					PAGE_Assignment.assignmentMarker.setPosition(place.geometry.location);
					PAGE_Assignment.assignmentCircle.setCenter(place.geometry.location);
					if(place.geometry.viewport){
						PAGE_Assignment.assignmentMap.fitBounds(place.geometry.viewport);
					}
					else{
						PAGE_Assignment.assignmentMap.panTo(place.geometry.location);
						if(!(PAGE_Assignment.assignmentCircle.getRadius() >= 100))
							PAGE_Assignment.assignmentMap.setZoom(18);
						else
							PAGE_Assignment.assignmentMap.fitBounds(PAGE_Assignment.assignmentCircle.getBounds());
					}
				}
				else{
					console.log("incorrect place");
				}
			});
		}
		
		$('#assignment-title-input').val(PAGE_Assignment.assignment.title).trigger('keydown');
		$('#assignment-description-input').val(PAGE_Assignment.assignment.caption).trigger('keydown');
		$('#assignment-radius-input').val(Math.round(PAGE_Assignment.assignment.location.radius * FEET_PER_MILE)).trigger('keydown');
		$('#assignment-location-input').val(PAGE_Assignment.assignment.location.googlemaps).trigger('keydown');
		
		var lat = PAGE_Assignment.assignment.location.geo.coordinates[1];
		var lng = PAGE_Assignment.assignment.location.geo.coordinates[0];
		var center = new google.maps.LatLng(lat, lng);
		var radius = milesToMeters(PAGE_Assignment.assignment.location.radius >= 250 ? PAGE_Assignment.assignment.location.radius : 250);
		
		PAGE_Assignment.assignmentMarker.setPosition(center);
		PAGE_Assignment.assignmentCircle.setCenter(center);
		PAGE_Assignment.assignmentCircle.setRadius(radius);
		
		PAGE_Assignment.assignmentMap.fitBounds(PAGE_Assignment.assignmentCircle.getBounds());
		
		if (PAGE_Assignment.assignment.expiration_time > Date.now()) {
			var expiration_time = moment(PAGE_Assignment.assignment.expiration_time, 'x');
			var now = moment();
			//expiration_time.diff rounds down, so add 1 to compensate
			$('#assignment-expiration-input').val(expiration_time.diff(now, "hours") + 1).trigger('keydown');
		}
	}
};

$(document).ready(function(){
	PAGE_Assignment.refreshList();
	$('.filter-type').click(function(){
		$('.filter-text').text($(this).text());
		if($(this).text() == 'Verified content'){
			PAGE_Assignment.filter = 'verify';
		}
		else{
			PAGE_Assignment.filter = 'all';
		}
		PAGE_Assignment.refreshList();
	});
	
	$('.sort-type').click(function(){
		$('.sort-text').text($(this).text());
		if($(this).text() == 'By capture time'){
			PAGE_Assignment.sort_key = 'time_created';
		}
		else{
			PAGE_Assignment.sort_key = 'gallery_time';
		}
		PAGE_Assignment.refreshList();
	});
	
	$('.assignment-expire').click(function(){
		$.ajax({
			url: "/scripts/assignment/expire",
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				id: PAGE_Assignment.assignment._id
			}),
			dataType: 'json',
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
				window.location.reload();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	});
	
	//Assignment edit listeners
	$('#assignment-edit-button').click(function(){
		PAGE_Assignment.assignmentUpdate();
	});
	$('#assignment-revert-button').click(function(){
		PAGE_Assignment.assignmentUpdate();
	});
	$('#assignment-clear-button').click(function(){
		$('.assignment input').val('').trigger('keyup');
		$('.assignment textarea').val('').trigger('keyup');
	});
	$('#assignment-save-button').click(function(){
		return PAGE_Assignment.assignmentSave();
	});
	$('#assignment-radius-input').keyup(function(e){
		PAGE_Assignment.assignmentCircle.setRadius(milesToMeters($(this).val() / 5280));
		PAGE_Assignment.assignmentMap.fitBounds(PAGE_Assignment.assignmentCircle.getBounds());
	});
	$('.post-link').on('click', function(e){
		e.preventDefault();
		window.location.href = $(this).prop('href')+'?assignment='+PAGE_Assignment.assignment._id;
	});
});