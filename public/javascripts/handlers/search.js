var PAGE_Search = {
	query: '',
	tags: '',
	location: {
		lat: null,
		lon: null,
		radius: null
	},
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
			},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(story){
					var elem = PAGE_Search.makeStoryListItem(story);
					$('#stories').append(elem);
					PAGE_Search.story_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
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
				tags: PAGE_Search.tags
			},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(post){
					var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', true);
					$('#posts').append(elem);
					PAGE_Search.post_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
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
				tags: PAGE_Search.tags
			},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(assignment){
					var elem = PAGE_Search.makeAssignmentListItem(assignment);
					$('#assignments').append(elem);
					PAGE_Search.assignment_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
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
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(user){
					var elem = PAGE_Search.makeUserListItem(user);
					$('#users').append(elem);
					PAGE_Search.user_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
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
			(PAGE_Search.location.lat !== null && PAGE_Search.location.lon !== null && PAGE_Search.location.radius ? '&lat=' + PAGE_Search.location.lat + '&lon=' + PAGE_Search.location.lon + '&r=' + PAGE_Search.location.radius : '')
		);
		
		if (PAGE_Search.location.lat === null || PAGE_Search.location.lon === null)
			$('.filter-location .filter-text').text('Any Location');
		
		PAGE_Search.refreshStories();
		PAGE_Search.refreshPosts();
		PAGE_Search.refreshAssignments();
		PAGE_Search.refreshUsers();
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
			center: new google.maps.LatLng(PAGE_Search.location.lat, PAGE_Search.location.lon),
			zoom: 12,
			mapTypeControl: false,
			styles: styles
		};

		map.map = new google.maps.Map(document.getElementsByClassName(map.classes.container)[0], mapOptions);
		map.map.addListener('click', function(e){
			if (PAGE_Search.location.lat && PAGE_Search.location.lon){
				PAGE_Search.searchGoogleMap.marker.setMap(PAGE_Search.searchGoogleMap.map);
				PAGE_Search.searchGoogleMap.circle.setMap(PAGE_Search.searchGoogleMap.map);
				PAGE_Search.searchGoogleMap.marker.setPosition(e.latLng);
				PAGE_Search.searchGoogleMap.circle.setPosition(e.latLng);
				
				PAGE_Search.location.lat = e.latLng.lat();
				PAGE_Search.location.lon = e.latLng.lng();
			}else{
				PAGE_Search.searchGoogleMap.marker.setMap(null);
				PAGE_Search.searchGoogleMap.circle.setMap(null);
				
				PAGE_Search.location.lat = PAGE_Search.location.lon = null;
			}
		});

		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};
		
		if (PAGE_Search.location.lat !== null && PAGE_Search.location.lon !== null){
			map.marker = new google.maps.Marker({
				position: new google.maps.LatLng(PAGE_Search.location.lat, PAGE_Search.location.lat),
				map: map.map,
				icon: image
			});
			map.circle = new google.maps.Circle({
				map: map.map,
				center: new google.maps.LatLng(PAGE_Search.location.lat, PAGE_Search.location.lat),
				radius: 1,
	
				strokeWeight: 0,
				fillColor: '#ffc600',
				fillOpacity: 0.26
			});
		}

		map.autocomplete = new google.maps.places.Autocomplete(document.getElementsByClassName(map.classes.location)[0]);
		if (map.location) map.location.keyup();
		google.maps.event.addListener(map.autocomplete, 'place_changed', function(){
			var place = map.autocomplete.getPlace();
			if(place.geometry){
				map.marker.setPosition(place.geometry.location);
				if (map.circle) map.circle.setCenter(place.geometry.location);
				if(place.geometry.viewport){
					map.map.fitBounds(place.geometry.viewport);
				}else{
					map.map.panTo(place.geometry.location);
					if(!(map.circle && map.circle.getRadius() >= 100))
						map.map.setZoom(18);
					else
						map.map.fitBounds(map.circle.getBounds());
				}
				
				if (place.formatted_address)
					$('.filter-location .filter-text').html(place.formatted_address);
					
				
				PAGE_Search.location.lat = place.geometry.location.H;
				PAGE_Search.location.lon = place.geometry.location.L;
				if (!PAGE_Search.location.radius) PAGE_Search.location.radius = 1000;
				
				PAGE_Search.refresh();
			}
		});
		
		if(map.circle && map.classes.radius){
			$('.' + map.classes.radius).on('change', function(){
				var radius = feetToMeters(parseInt($(this).val()))
				map.circle.setRadius(radius);
				
				if(!(map.circle || map.circle.getRadius() >= 100))
					map.map.setZoom(18);
				else
					map.map.fitBounds(map.circle.getBounds());
			});			
		}
	}
};

$(document).ready(function() {
	if (PAGE_Search.tags) for (var index in PAGE_Search.tags.split(','))
		addTagToQuery(PAGE_Search.tags.split(',')[index]);
		
	PAGE_Search.initMap(PAGE_Search.searchGoogleMap);	
	PAGE_Search.refresh();
	
	$('#sidebar-search').val(PAGE_Search.query);
	if (PAGE_Search.location.radius){
		$('.search-radius')
			.val(PAGE_Search.location.radius)
			.trigger('keyup');
		
		if (PAGE_Search.location.lat && PAGE_Search.location.lon){
			PAGE_Search.searchGoogleMap.map.setCenter({lat: PAGE_Search.location.lat, lng: PAGE_Search.location.lon});
		}
	}
	
	$('.search-radius').on('blur', function(e){
		var _this = $(this);
			
		PAGE_Search.location.radius = parseFloat(_this.val());
		
		if (isNaN(PAGE_Search.location.radius)){
			PAGE_Search.location.radius = null;
			setTimeout(function(){_this.val('')},0);
			return e.preventDefault();
		}
		
		PAGE_Search.refresh();
	});
	$('.search-location').on('blur', function(e){
		if (!PAGE_Search.searchGoogleMap.autocomplete.getPlace()){
			PAGE_Search.location.lat = PAGE_Search.location.lon = null;
			PAGE_Search.refresh();
		}
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