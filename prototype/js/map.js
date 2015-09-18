/// <reference path="../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

function milesToMeters(miles){
	return 1609.34 * miles;
}

function initialize()
{
	var mapOptions = {
		center: new google.maps.LatLng(40.7, -74),
		zoom: 12,
		mapTypeControl: true,
	    mapTypeControlOptions: {
	        position: google.maps.ControlPosition.LEFT_BOTTOM
	    }
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	google.maps.event.addListenerOnce(map, 'idle', function(){
		Assignments.getAllAssignments(function(err, assignments){
			assignments.forEach(function(assignment, index, array){
				var lat = assignment.location.geo.coordinates[1];
				var lng = assignment.location.geo.coordinates[0];
				
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					map: map,
					title: assignment.title
				});
				
				var circle = new google.maps.Circle({
					map: map,
					center: new google.maps.LatLng(lat, lng),
					radius: milesToMeters(assignment.location.radius),
					
					strokeColor: "#0000FF",
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: "#0000FF",
					fillOpacity: 0.15
				});
				
				assignment.map = {};
				assignment.map.marker = marker;
				assignment.map.circle = circle;
				
				var expTimeStr = 'Expires in ' + moment(assignment.expiration_time, 'x').fromNow();
				if (!assignment.expiration_time) {
					expTimeStr = 'Never Expires';
				}
				
				var locationStr = assignment.location.googlemaps;
				if (!assignment.location.googlemaps) {
					locationStr = "Unknown";
				}
				
				var elemText = '<div class="list-item">' +
					'<div>' +
						'<img class="img-circle" src="../img/placeholder-photo.jpg">' +
					'</div>' +
					'<div class="flexy">' +
						'<span class="md-type-body2">' + assignment.title + '</span>' +
						'<span class="md-type-caption md-type-black-secondary">' + locationStr + ' &bull; ' + expTimeStr + '</span>' +
					'</div>' +
				'</div>';
				var elem = $(elemText);
				elem.on('click', function(){
					map.fitBounds(circle.getBounds());
				});
				$('.list').append(elem);
			});
		});
	});
}
google.maps.event.addDomListener(window, 'load', initialize);