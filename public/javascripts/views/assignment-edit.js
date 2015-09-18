var Assignments = {
	updateAssignment: function(params, callback){
		$.ajax("/scripts/assignment/update",{
			data: params,
			method: 'POST',
			success: function(result){
				if (result.err) return callback(result.err, null);
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				return callback(error, null);
			}
		});
	}
};

$(document).ready(function(){
	$('#assignment-edit-button').click(function(){
		assignmentUpdate();
	});
	$('#assignment-revert-button').click(function(){
		assignmentUpdate();
	});
	$('#assignment-clear-button').click(function(){
		$('.assignment input').val('').trigger('keyup');
		$('.assignment textarea').val('').trigger('keyup');
	});
	$('#assignment-save-button').click(function(){
		return assignmentSave();
	});
	
	$('#assignment-radius-input').keyup(function(e){
		assignmentCircle.setRadius(milesToMeters($(this).val() / 5280));
		assignmentMap.fitBounds(assignmentCircle.getBounds());
	});
});

var initialAssignmentToggle = true;
var assignmentMarker = null;
var assignmentCircle = null;
var assignmentMap = null;
var assignmentAutocomplete = null;

function assignmentUpdate(){
	if (initialAssignmentToggle) {
		initialAssignmentToggle = false;
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
		
		assignmentMap = new google.maps.Map(document.getElementById('assignment-map-canvas'), mapOptions);
		
		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};
		
		assignmentMarker = new google.maps.Marker({
			position: new google.maps.LatLng(40.7, -74),
			map: assignmentMap,
			icon: image
		});
		
		assignmentCircle = new google.maps.Circle({
			map: assignmentMap,
			center: new google.maps.LatLng(40.7, -74),
			radius: 1,
	
			strokeWeight: 0,
			fillColor: '#ffc600',
			fillOpacity: 0.26
		});
		
		assignmentAutocomplete = new google.maps.places.Autocomplete(document.getElementById('assignment-location-input'));
		$('#assignment-location-input').attr('placeholder', '');
		google.maps.event.addListener(assignmentAutocomplete, 'place_changed', function(){
			var place = assignmentAutocomplete.getPlace();
			if(place.geometry){
				assignmentMarker.setPosition(place.geometry.location);
				assignmentCircle.setCenter(place.geometry.location);
				if(place.geometry.viewport){
					assignmentMap.fitBounds(place.geometry.viewport);
				}
				else{
					assignmentMap.panTo(place.geometry.location);
					if(!(assignmentCircle.getRadius() >= 100))
						assignmentMap.setZoom(18);
					else
						assignmentMap.fitBounds(assignmentCircle.getBounds());
				}
			}
			else{
				console.log("incorrect place");
			}
		});
	}
	
	$('#assignment-title-input').val(assignment.title).trigger('keydown');
	$('#assignment-description-input').val(assignment.caption).trigger('keydown');
	$('#assignment-radius-input').val(Math.round(assignment.location.radius * FEET_PER_MILE)).trigger('keydown');
	$('#assignment-location-input').val(assignment.location.googlemaps).trigger('keydown');
	
	var lat = assignment.location.geo.coordinates[1];
	var lng = assignment.location.geo.coordinates[0];
	var center = new google.maps.LatLng(lat, lng);
	var radius = milesToMeters(assignment.location.radius);
	
	assignmentMarker.setPosition(center);
	assignmentCircle.setCenter(center);
	assignmentCircle.setRadius(radius);
	
	assignmentMap.fitBounds(assignmentCircle.getBounds());
	
	if (assignment.expiration_time > Date.now()) {
		var expiration_time = moment(assignment.expiration_time, 'x');
		var now = moment();
		//expiration_time.diff rounds down, so add 1 to compensate
		$('#assignment-expiration-input').val(expiration_time.diff(now, "hours") + 1).trigger('keydown');
	}
}

function assignmentSave(){
	var place = assignmentAutocomplete.getPlace(),
		params = {
			id: assignment._id,
			lat: assignmentMarker.getPosition().lat(),
			lon: assignmentMarker.getPosition().lng(),
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
	
	Assignments.updateAssignment(params, function(err, newAssignment){
		if (!err)
			window.location.reload();
	});
}