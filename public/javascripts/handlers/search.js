var PAGE_Search = {
	query: '',
	tags: '',
	location: null,
	purchases: [],
	verified: true,
	searchGoogleMap: {
		marker: null,
		circle: true,
		map: null,
		autocomplete: null,
		classes: {
			location: 'search-location',
			container: 'search-map-container',
			radius:	'search-radius'
		}
	},
	
	
	
	makeStoryListItem: function(story) {
		var elemText = '<li><a href="/story/' + story._id + '">' + story.title + '</a></li>';
		return $(elemText);
	},
	makeAssignmentListItem: function(assignment) {
		var elemText = '<li><a href="/assignment/' + assignment._id + '">' + assignment.title + '</a></li>';
		return $(elemText);
	},
	makeUserListItem: function(user) {
		var image = user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';
		var twitter = user.twitter ? '<a href="http://www.twitter.com/' + user.twitter + '">@' + user.twitter : 'No Twitter';
		var outlet = user.outlet ? '<a href="/outlet/' + user.outlet._id + '">' + user.outlet.title + '</a>' : 'No Outlet';
		var elemText =  '<li class="meta-user">' +
		'	<div>' +
		'		<a href="/user/' + user._id + '"><img class="img-circle img-responsive" src="' + image + '"></a>' +
		'	</div>' +
		'	<div>' +
		'		<a href="/user/' + user._id + '"><span class="md-type-title">' + user.firstname + ' ' + user.lastname + '</span></a>' +
		'		<span class="md-type-body1">' + twitter + ' &bull; ' + outlet + '</span>' +
		'	</div>' +
		'</li>';
		return $(elemText);
	},
	story_offset: 0,
	story_loading: false,
	refreshStories: function(callback) {
		if (PAGE_Search.story_loading) return;
		PAGE_Search.story_loading = true;
		
		$.ajax({
			url: '/scripts/story/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.story_offset,
				limit: 10,
				verified: PAGE_Search.verified,
				tags: PAGE_Search.tags,
				polygon: PAGE_Search.searchGoogleMap.circle.getMap() == null ? undefined : encodeURIComponent(JSON.stringify(circleToPolygon(PAGE_Search.searchGoogleMap.circle, 8)))
			},
			success: function(result) {
				if (result.err)
					return this.error(null, null, result.err);
					
				result.data.forEach(function(story){
					var elem = PAGE_Search.makeStoryListItem(story);
					$('#stories').append(elem);
					PAGE_Search.story_offset += 1;
				});
				
				if (callback) callback();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				if (callback) callback(error);
			},
			complete: function(){
				PAGE_Search.story_loading = false;
			}
		});
	},
	post_offset: 0,
	post_loading: false,
	refreshPosts: function(callback) {
		if (PAGE_Search.post_loading) return;
		PAGE_Search.post_loading = true;
		
		$.ajax({
			url: '/scripts/gallery/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.post_offset,
				limit: 12,
				verified: PAGE_Search.verified,
				tags: PAGE_Search.tags,
				polygon: PAGE_Search.searchGoogleMap.circle.getMap() == null ? undefined : encodeURIComponent(JSON.stringify(circleToPolygon(PAGE_Search.searchGoogleMap.circle, 8)))
			},
			success: function(result) {
				if (result.err)
					return this.error(null, null, result.err);
					
				result.data.forEach(function(post){
					var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', true);
					$('#posts').append(elem);
					PAGE_Search.post_offset += 1;
				});
				
				if (callback) callback();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				if (callback) callback(error);
			},
			complete: function(){
				PAGE_Search.post_loading = false;
			}
		});
	},
	assignment_offset: 0,
	assignment_loading: false,
	refreshAssignments: function(callback) {
		if (PAGE_Search.assignment_loading) return;
		PAGE_Search.assignment_loading = true;
		
		$.ajax({
			url: '/scripts/assignment/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.assignment_offset,
				limit: 10,
				verified: PAGE_Search.verified,
				tags: PAGE_Search.tags,
				lat: PAGE_Search.location ? PAGE_Search.location.latlng.lat : undefined,
				lon: PAGE_Search.location ? PAGE_Search.location.latlng.lng : undefined,
				radius: PAGE_Search.location ? PAGE_Search.location.radius : undefined
			},
			success: function(result) {
				if (result.err)
					return this.error(null, null, result.err);
					
				result.data.forEach(function(assignment){
					var elem = PAGE_Search.makeAssignmentListItem(assignment);
					$('#assignments').append(elem);
					PAGE_Search.assignment_offset += 1;
				});
				
				if (callback) callback();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				if (callback) callback(error);
			},
			complete: function(){
				PAGE_Search.assignment_loading = false;
			}
		});
	},
	user_offset: 0,
	user_loading: false,
	refreshUsers: function(callback) {
		if (PAGE_Search.user_loading) return;
		PAGE_Search.user_loading = true;
		
		$.ajax({
			url: '/scripts/user/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.user_offset,
				limit: 10,
				verified: PAGE_Search.verified,
				tags: PAGE_Search.tags
			},
			success: function(result) {
				if (result.err)
					return this.error(null, null, result.err);
					
				result.data.forEach(function(user){
					var elem = PAGE_Search.makeUserListItem(user);
					$('#users').append(elem);
					PAGE_Search.user_offset += 1;
				});
				
				if (callback) callback();
			},
			error: function(xhr, status, error ){
				$.snackbar({content: resolveError(error)});
				if (callback) callback(error);
			},
			complete: function(){
				PAGE_Search.user_loading = false;
			}
		});
	},
	refresh: function(){
		PAGE_Search.story_offset = 0;
		PAGE_Search.post_offset = 0;
		PAGE_Search.assignment_offset = 0;
		PAGE_Search.user_offset = 0;
		
		$('#stories').empty();
		$('#posts').empty();
		$('#assignments').empty();
		$('#users').empty();
		
		var tags = [];
		$('#tag-filter').find('.tag').each(function(i, elem){
			tags.push($(elem).text().substr(1));
		});
		$('#tag-dropdown').text(tags.length > 0 ? 'Tags: ' + tags.join(', ') : 'Any tags');
		PAGE_Search.tags = tags.join(',');
		
		window.history.pushState(
			{},
			null,
			'?q=' + encodeURIComponent(PAGE_Search.query) +
			(tags.length > 0 ? '&tags=' + encodeURIComponent(PAGE_Search.tags) : '') +
			(PAGE_Search.location ? '&lat=' + PAGE_Search.location.latlng.lat + '&lon=' + PAGE_Search.location.latlng.lng + '&r=' + PAGE_Search.location.radius : '')
		);
		
		if (!PAGE_Search.location)
			$('.filter-location .filter-text').text('Location');
		
		PAGE_Search.refreshStories();
		PAGE_Search.refreshPosts();
		PAGE_Search.refreshAssignments();
		PAGE_Search.refreshUsers();
	},
	updateMarker: function(){
		if (PAGE_Search.location){
			PAGE_Search.searchGoogleMap.marker.setMap(PAGE_Search.searchGoogleMap.map);
			PAGE_Search.searchGoogleMap.circle.setMap(PAGE_Search.searchGoogleMap.map);
			
			PAGE_Search.searchGoogleMap.marker.setPosition(PAGE_Search.location.latlng);
			PAGE_Search.searchGoogleMap.circle.setCenter(PAGE_Search.location.latlng);
			PAGE_Search.searchGoogleMap.circle.setRadius(milesToMeters(PAGE_Search.location.radius || 10));
			
			PAGE_Search.searchGoogleMap.map.fitBounds(PAGE_Search.searchGoogleMap.circle.getBounds());
		}else{
			PAGE_Search.searchGoogleMap.marker.setMap(null);
			PAGE_Search.searchGoogleMap.circle.setMap(null);
		}
		
		PAGE_Search.refresh();
	},
	initMap: function(map){
		var styles = [{"featureType": "all", "elementType":"all", "stylers": [{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"all","stylers":[{"gamma":1.54}]},
			{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},
			{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#bdbdbd"}]},
			{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},
			{"featureType":"poi.park","elementType":"all","stylers":[{"gamma":1.26}]},
			{"featureType":"poi.park","elementType":"labels.text","stylers":[{"saturation":-54}]}];

		var mapOptions = {
			zoom: 8,
			mapTypeControl: false,
			styles: styles
		};
		
		if (PAGE_Search.location)
			mapOptions.center = PAGE_Search.location.latlng;
		// else if (navigator && navigator.geolocation)
		// 	mapOptions.center = {
		// 		lat: ,
		// 		lng: 
		// 	};
		else
			mapOptions.center = {
				lat: 40.756907,
				lng: -73.972128
			};

		map.map = new google.maps.Map(document.getElementsByClassName(map.classes.container)[0], mapOptions);
		map.map.addListener('click', function(e){
			var radius = parseFloat($('.' + PAGE_Search.searchGoogleMap.classes.radius).val());
			
			if (isNaN(radius))
				$('.' + PAGE_Search.searchGoogleMap.classes.radius).val(radius = 10).keyup();
			
			PAGE_Search.location = {
				latlng: {
					lat: e.latLng.lat(),
					lng: e.latLng.lng()
				},
				radius: radius
			};
			
			PAGE_Search.updateMarker();
			PAGE_Search.refresh();
		});

		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};
		
		map.marker = new google.maps.Marker({
			center: PAGE_Search.location ? PAGE_Search.location.latlng : {lat: 10, lng: 10},
			map: PAGE_Search.location ? map.map : null,
			icon: image
		});
		map.marker.addListener('click', function(e){
			PAGE_Search.location = null;
			PAGE_Search.updateMarker();
			PAGE_Search.refresh();
		});
		
		map.circle = new google.maps.Circle({
			map: PAGE_Search.location ? map.map : null,
			center: PAGE_Search.location ? PAGE_Search.location.lat : {lat: 10, lng: 10},
			radius: PAGE_Search.location ? milesToMeters(PAGE_Search.location.radius) : 1,

			clickable: false,
			strokeWeight: 0,
			fillColor: '#ffc600',
			fillOpacity: 0.26
		});

		map.autocomplete = new google.maps.places.Autocomplete(document.getElementsByClassName(map.classes.location)[0]);
		//if (map.location) map.location.keyup();
		google.maps.event.addListener(map.autocomplete, 'place_changed', function(){
			var place = map.autocomplete.getPlace();
			if(place.geometry){
				PAGE_Search.location = {
					latlng: {
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng()
					},
					//Rounded to 3 decimals (500 = 0.5 * 1000)
					radius: place.geometry.viewport ?
								Math.round(500 * google.maps.geometry.spherical.computeDistanceBetween(place.geometry.viewport.getNorthEast(), place.geometry.viewport.getSouthWest(), 3959)) / 1000 :
								0.25
				};
				
				$('.' + PAGE_Search.searchGoogleMap.classes.radius).val(PAGE_Search.location.radius).keyup();
				PAGE_Search.updateMarker();
			}
		});
		
		$('.' + map.classes.radius).on('change', function(){
			var radius = parseInt($(this).val());
			map.circle.setRadius(milesToMeters(radius));
			
			map.map.fitBounds(map.circle.getBounds());
		});
	}
};

$(document).ready(function() {
	if (PAGE_Search.tags) for (var index in PAGE_Search.tags.split(','))
		addTagToQuery(PAGE_Search.tags.split(',')[index]);
		
	PAGE_Search.initMap(PAGE_Search.searchGoogleMap);
	PAGE_Search.updateMarker();
	PAGE_Search.refresh();
	
	$('#sidebar-search').val(PAGE_Search.query);
	if (PAGE_Search.location && PAGE_Search.location.radius != null){
		$('.' + PAGE_Search.searchGoogleMap.classes.radius)
			.val(PAGE_Search.location.radius)
			.trigger('keyup');
	}
	
	$('.' + PAGE_Search.searchGoogleMap.classes.radius).on('blur', function(e){
		PAGE_Search.refresh();
	}).on('change textInput input', function(e){
		if (!PAGE_Search.location) return;
		var radius = parseFloat($(this).val());
		
		if (isNaN(radius)) return true;
		
		PAGE_Search.location.radius = radius;
		PAGE_Search.updateMarker();
	});
	
	$('.filter-type').click(function(){
		$('.filter-text').text($(this).text());
		if($(this).text() == 'Verified content' && !PAGE_Search.verified){
			PAGE_Search.verified = true;
			PAGE_Search.refresh();
		}
		else if ($(this).text() == 'All content' && PAGE_Search.verified){
			PAGE_Search.verified = false;
			PAGE_Search.refresh();
		}
		
		$('.filter-button').click();
		
		$('.filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.time-display-filter-type').click(function(){
		$('.time-display-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'relative'){
			PAGE_Search.display = 'relative';
		}
		else if ($(this).data('filter-type') == 'absolute'){
			PAGE_Search.display = 'absolute';
		}
		setTimeDisplayType(PAGE_Search.display);
		$('.time-display-filter-button').click();
		
		$('.time-display-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.filter-location > .toggle-drop').on('click', function(e){
		google.maps.event.trigger(PAGE_Search.searchGoogleMap.map,'resize');
		PAGE_Search.updateMarker();
	});
	
	$('#tag-filter-input').change(function(){
		addTagToQuery($(this).val());
		$(this).val('');
		PAGE_Search.refresh();
	});
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Search.post_loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Search.refreshPosts();
	});
});

function addTagToQuery(tag){
	var elem = makeTag('#' + tag);
	$('#tag-filter').append(elem);
	$(this).val('');
	elem.click(function(){
		PAGE_Search.refresh();
	});
}