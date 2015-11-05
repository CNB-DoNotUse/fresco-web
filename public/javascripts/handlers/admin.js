var PAGE_Admin = {
	MARKER_ZOOM_LEVEL: 14,
	tab: '',

	//Is this the first assignment load after the page loaded?
	firstLoad: true,

	//Assignments tab
	assignments: [],
	assignmentTitle: null,
	assignmentCaption: null,
	assignmentLocation: null,
	assignmentRadius: null,
	assignmentHours: null,
	assignmentApprove: null,
	assignmentDeny: null,

	assignmentGoogleMap: {
		marker: null,
		circle: true,
		map: null,
		autocomplete: null,
		classes: {
			location: 'assignment-location',
			container: 'assignment-map-container',
			radius:	'assignment-radius'
		}
	},

	//Submissions tab
	submissions: [],
	submissionImages: null,
	submissionCaption: null,
	submissionByline: null,
	submissionTags: null,
	submissionSuggestedTags: null,
	submissionStories: null,
	submissionStoriesInput: null,
	submissionSuggestedStories: null,
	submissionLocation: null,
	submissionRevert: null,
	submissionVerify: null,
	submissionDelete: null,
	submissionSkip: null,

	submissionGoogleMap: {
		marker: null,
		polygon: null,
		map: null,
		autocomplete: null,
		classes: {
			location: 'submission-location',
			container: 'submission-map-container'
		}
	},

	//Imports tab
	imports: [],
	importsImages: null,
	importsCaption: null,
	importsByline: null,
	importsTags: null,
	importsSuggestedTags: null,
	importsStories: null,
	importsStoriesInput: null,
	importsSuggestedStories: null,
	importsLocation: null,
	importsRevert: null,
	importsVerify: null,
	importsSkip: null,
	importsDelete: null,
	importsImportTwitter: null,
	importsImportLocal: null,
	importsImportLocalFiles: null,
	importsName: null,
	importsAffiliation: null,
	importsOtherOrigin: null,

	importsGoogleMap: {
		marker: null,
		polygon: null,
		map: null,
		autocomplete: null,
		classes: {
			location: 'import-location',
			container: 'import-map-container'
		}
	},

	Assignment: {
		approve: function(options, cb){
			$.ajax({
				url: '/scripts/assignment/approve',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify(options),
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					PAGE_Admin.load.assignments();
					PAGE_Admin.autofill.assignments(null);
					if (cb) cb();
				},
				error: function(xhr, status, error){
					if (cb) cb(error);
				}
			});
		},
		deny: function(id, cb){
			$.ajax({
				url: '/scripts/assignment/deny',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify({
					id: id
				}),
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					PAGE_Admin.load.assignments();
					if(cb) cb();
				},
				error: function(xhr, status, error){
					if (cb) cb(error);
				}
			});
		}
	},
	Gallery: {
		verify: function(options, cb){
			$.ajax({
				url: '/scripts/gallery/verify',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify(options),
				dataType: 'json',
				success: function(result, status, xhr){
					cb(result.err);
				},
				error: function(xhr, status, error){
					cb(error)
				}
			});
		},
		skip: function(id, cb){
			$.ajax({
				url: '/scripts/gallery/skip',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify({
					id: id
				}),
				dataType: 'json',
				success: function(result, status, xhr){
					cb(result.err);
				},
				error: function(xhr, status, error){
					cb(error)
				}
			});
		},
		delete: function(id, cb){
			$.ajax({
				url: '/scripts/gallery/remove',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify({
					id: id
				}),
				dataType: 'json',
				success: function(result, status, xhr){
					cb(result.err);
				},
				error: function(xhr, status, error){
					cb(error)
				}
			});
		},
		import: function(formdata, cb){
			$.ajax({
				url: '/scripts/gallery/import',
				type: 'POST',
				data: formdata,
        		processData: false,
        		contentType: false,
		        cache: false,
		        dataType: 'json',
				success: function(result, status, xhr){
					cb(result.err, result.data);
				},
				error: function(xhr, status, error){
					cb(error)
				}
			});
		}
	},
	load: {
		assignments: function(cb){
			var assignmentsList = $('.tab-assignments > .list');

			$.ajax({
				url: API_URL + '/v1/assignment/pending?limit=9',
				type: 'get',
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					var listString = '',
						old_assignments = PAGE_Admin.assignments.concat(),
						same = true;
					PAGE_Admin.assignments = result.data.concat();
					same = PAGE_Admin.assignments.length == old_assignments.length;

					if(PAGE_Admin.assignments.length == 0 && PAGE_Admin.firstLoad) {
						$('[data-tab="submissions"]').click();
					}
					PAGE_Admin.firstLoad = false;

					for (var index in PAGE_Admin.assignments){
						var a = result.data[index];

						if (!old_assignments[index] || PAGE_Admin.assignments[index]._id != old_assignments[index]._id)
							same = false;

						listString +=
						'<div class="list-item" data-index="' + index + '">'+
							'<div>'+
								'<a href="/outlet/' + a.outlet._id + '" target="_blank"><img class="img-circle" src="' + (a.outlet.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png') + '"></a>'+
							'</div>'+
							'<div class="flexy">'+
								'<p class="md-type-body1"><a href="/assignment/' + a._id + '" target="_blank">' + a.title + '</a></p>'+
							'</div>'+
							'<div>'+
								'<p class="md-type-body1">' + a.location.googlemaps + '</p>'+
							'</div>'+
							'<div>'+
								'<p class="md-type-body1">' + timestampToDate(a.expiration_time) + '</p>'+
							'</div>'+
						'</div>';
					}

					if (same)
						return cb ? cb() : null;

					assignmentsList.html('').append(listString);
					assignmentsList.find('.list-item').on('click', function(){
						var assignment = PAGE_Admin.assignments[parseInt($(this).data('index'))];
						$('.form-control').keydown();
						$('.list-item').removeClass('active');
						$(this).addClass('active');

						PAGE_Admin.autofill.assignments(assignment);
					});

					assignmentsList.find('.list-item')[0].click();

					if (cb) cb(null, same);
				},
				error: function(xhr, status, error){
					if (cb) cb(error, false);
				}
			});
		},
		submissions: function(cb){
			var submissionsList = $('.tab-submissions > .list');

			$.ajax({
				url: API_URL + '/v1/gallery/submissions',
				type: 'get',
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					var listString = '',
						old_submissions = PAGE_Admin.submissions.concat(),
						same = true;
					PAGE_Admin.submissions = result.data.concat();
					same = PAGE_Admin.submissions.length == old_submissions.length;

					for (var index in PAGE_Admin.submissions){
						if (!old_submissions[index] || PAGE_Admin.submissions[index]._id != old_submissions[index]._id)
							same = false;
						var sub = result.data[index],
							location = 'No Location';
							
						for (var i in sub.posts){
							if (sub.posts[i].location.address){
								location = sub.posts[i].location.address;
								break;
							}
						}

						var assignmentText = '<div>'+
							'<p class="md-type-body1">' + location + '</p>'+
						'</div>';
						if(sub.assignment){
							assignmentText = '<div>' +
							'	<p class="md-type-body2 assignment-link" data-id="' + sub.assignment._id + '">' + sub.assignment.title + '</p>' +
							'	<p class="md-type-body1 assignment-location">' + location + '</p>' +
							'</div>';
						}
						
						listString +=
							'<div class="list-item" data-index="' + index + '">'+
								'<div>'+
									'<a href="/gallery/' + sub._id + '" target="_blank"><img class="img-circle" src="' + formatImg(sub.posts[0].image, 'small') + '"></a>'+
								'</div>'+
								'<div class="flexy">'+
									'<p class="md-type-body1">' + (sub.caption || '') + '</p>'+
								'</div>'+
								'<div>'+
									(sub.owner ? ('<p class="md-type-body2"><a href="/user/' + sub.owner._id + '" target="_blank">' + (sub.owner ? sub.owner.firstname : '') + ' ' + (sub.owner ? sub.owner.lastname : '') + '</a></p>') : '')+
								'</div>'+
									assignmentText +
								'<div>'+
									'<p class="md-type-body1">' + timestampToDate(sub.time_created) + '</p>'+
								'</div>'+
							'</div>'
					}

					if (same)
						return cb ? cb() : null;

					submissionsList.html('').append(listString);

					submissionsList.find('.assignment-link').click(function(){
						window.open('/assignment/' + $(this).data('id'));
					});

					submissionsList.find('.list-item').on('click', function(){
						$('.list-item').removeClass('active');
						$(this).addClass('active');

						var gallery = PAGE_Admin.submissions[parseInt($(this).data('index'))];
						PAGE_Admin.autofill.submissions(gallery);
					});

					submissionsList.find('.list-item')[0].click();

					if (cb) cb();
				},
				error: function(xhr, status, error){
					if (cb) cb(error, false);
				}
			});
		},
		imports: function(cb){
			var importList = $('.tab-imports > .list');

			$.ajax({
				url: '/scripts/gallery/imports',
				type: 'get',
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					var listString = '',
						old_imports = PAGE_Admin.imports.concat(),
						same = true;
					PAGE_Admin.imports = result.data.concat();
					same = PAGE_Admin.submissions.length == old_imports.length;

					for (var index in PAGE_Admin.imports){
						if (!old_imports[index] || PAGE_Admin.imports[index]._id != old_imports[index]._id)
							same = false;
						var sub = result.data[index],
							location = '';
							
						for (var i in sub.posts){
							if (sub.posts[i].location.address){
								location = sub.posts[i].location.address;
								break;
							}
						}

						listString +=
							'<div class="list-item" data-index="' + index + '">'+
								'<div>'+
									'<a href="/gallery/' + sub._id + '" target="_blank"><img class="img-circle" src="' + formatImg(sub.posts[0].image, 'small') + '"></a>'+
								'</div>'+
								'<div class="flexy">'+
									'<p class="md-type-body1">' + (sub.caption || '') + '</p>'+
								'</div>'+
								'<div>'+
									(sub.owner ? ('<p class="md-type-body2"><a href="/user/' + sub.owner._id + '" target="_blank">' + sub.owner.firstname + ' ' + sub.owner.lastname + '</a></p>') : '') +
								'</div>'+
								'<div>'+
									'<p class="md-type-body1">' + location + '</p>'+
								'</div>'+
								'<div>'+
									'<p class="md-type-body1">' + timestampToDate(sub.time_created) + '</p>'+
								'</div>'+
							'</div>'
					}

					if (same)
						return cb ? cb() : null;

					importList.html('').append(listString);

					importList.find('.list-item').on('click', function(){
						$('.list-item').removeClass('active');
						$(this).addClass('active');

						var gallery = PAGE_Admin.imports[parseInt($(this).data('index'))];
						PAGE_Admin.autofill.imports(gallery);
					});

					if (cb) cb();
				},
				error: function(xhr, status, error){
					if (cb) cb(error, false);
				}
			});
		}
	},
	autofill: {
		assignments: function(assignment){
			if (!assignment) assignment = {};

			var center = assignment.location ? new google.maps.LatLng(assignment.location.geo.coordinates[1], assignment.location.geo.coordinates[0]) : null;
			var radius = assignment.location ? milesToMeters(assignment.location.radius) : null;

			PAGE_Admin.setMarker(PAGE_Admin.assignmentGoogleMap, center, radius);

			PAGE_Admin.assignmentTitle.val(assignment.title || '');
			PAGE_Admin.assignmentCaption.val(assignment.caption || '');
			PAGE_Admin.assignmentLocation.val(assignment.location ? (assignment.location.googlemaps || '') : '');
			PAGE_Admin.assignmentRadius.val(assignment.location ? (Math.round(milesToFeet(assignment.location.radius)) || '') : '');
			PAGE_Admin.assignmentHours.val(assignment.expiration_time ? Math.ceil((assignment.expiration_time - Date.now()) / 3600000) : '');
			PAGE_Admin.assignmentApprove.attr('data-id', assignment._id || '');
			PAGE_Admin.assignmentDeny.attr('data-id', assignment._id || '');

			$('.form-control').filter(function(){return this.value != '';}).trigger('keydown');
			$('.form-control').filter(function(){return this.value == '';}).trigger('keyup');
		},
		submissions: function(gallery){
			if (!gallery) gallery = {};

			PAGE_Admin.setPolygon(PAGE_Admin.submissionGoogleMap, gallery.location ? gallery.location.coordinates[0] : null);

			PAGE_Admin.submissionTags.html('');
			PAGE_Admin.submissionSuggestedTags.html('');
			PAGE_Admin.submissionImages.html('');
			PAGE_Admin.submissionStoriesInput.val('');
			PAGE_Admin.submissionSuggestedStories.html('');
			PAGE_Admin.submissionStories.html('');
			
			if (gallery.related_stories){
				for (var story in gallery.related_stories)
					PAGE_Admin.submissionStories.append('<li class="chip"><div class="chip"><div class="icon"><span class="mdi mdi-minus icon md-type-subhead"></span></div><span class="chip md-type-body1 tag">' + story.title + '</span></div></li>');
			}

			if (gallery.tags)
				for (var index in gallery.tags)
					PAGE_Admin.submissionTags.append(makeTag('#' + gallery.tags[index]));

			if (gallery.posts){
				for (var index in gallery.posts){
					if (gallery.posts[index].video)
						PAGE_Admin.submissionImages.append('\
							<video width="100%" height="100%" data-id="' + gallery.posts[index]._id + '" controls>\
								<source src="' + gallery.posts[index].video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4') + '" type="video/mp4">\
								Your browser does not support the video tag.\
							</video>\
						');
					else
						PAGE_Admin.submissionImages.append('<img class="img-responsive" src="' + formatImg(gallery.posts[index].image, 'medium') + '" data-id="' + gallery.posts[index]._id + '"/>');
				}

				PAGE_Admin.submissionImages.frick();
			}

			PAGE_Admin.submissionCaption.val(gallery.caption || '');
			PAGE_Admin.submissionByline.val(gallery.posts && gallery.posts[0] ? gallery.posts[0].byline : '');
			PAGE_Admin.submissionLocation.val(gallery.posts ? (gallery.posts[0].location.address || '') : '');
			PAGE_Admin.submissionRevert.attr('data-id', gallery._id || '');
			PAGE_Admin.submissionVerify.attr('data-id', gallery._id || '');
			PAGE_Admin.submissionSkip.attr('data-id', gallery._id || '');
			PAGE_Admin.submissionDelete.attr('data-id', gallery._id || '');

			$('.form-control').filter(function(){return this.value != '';}).trigger('keydown');
			$('.form-control').filter(function(){return this.value == '';}).trigger('keyup');
		},
		imports: function(gallery){
			if (!gallery) gallery = {};

			PAGE_Admin.setPolygon(PAGE_Admin.importsGoogleMap, gallery.location ? gallery.location.coordinates[0] : null);

			PAGE_Admin.importsTags.html('');
			PAGE_Admin.importsSuggestedTags.html('');
			PAGE_Admin.importsImages.html('');
			PAGE_Admin.importsStoriesInput.val('');
			PAGE_Admin.importsSuggestedStories.html('');
			PAGE_Admin.importsStories.html('');
			
			if (gallery.related_stories){
				for (var story in gallery.related_stories)
					PAGE_Admin.importsStories.append('<li class="chip"><div class="chip"><div class="icon"><span class="mdi mdi-minus icon md-type-subhead"></span></div><span class="chip md-type-body1 tag">' + story.title + '</span></div></li>');
			}

			if (gallery.tags)
				for (var index in gallery.tags)
					PAGE_Admin.importsTags.append(makeTag('#' + gallery.tags[index]));

			if (gallery.posts){
				for (var index in gallery.posts){
					if (gallery.posts[index].video)
						PAGE_Admin.importsImages.append('\
							<video width="100%" height="100%" data-id="' + gallery.posts[index]._id + '" controls>\
								<source src="' + gallery.posts[index].video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4') + '" type="video/mp4">\
								Your browser does not support the video tag.\
							</video>\
						');
					else
						PAGE_Admin.importsImages.append('<img class="img-responsive" src="' + formatImg(gallery.posts[index].image, 'medium') + '" data-id="' + gallery.posts[index]._id + '"/>');
				}

				PAGE_Admin.importsImages.frick();
			}


			PAGE_Admin.importsCaption.val(gallery.caption || '');
			PAGE_Admin.importsByline.val(gallery.posts && gallery.posts[0] ? gallery.posts[0].byline : '');
			PAGE_Admin.importsLocation.val(gallery.posts ? (gallery.posts[0].location.address || '') : '');
			PAGE_Admin.importsRevert.attr('data-id', gallery._id || '');
			PAGE_Admin.importsVerify.attr('data-id', gallery._id || '');
			PAGE_Admin.importsSkip.attr('data-id', gallery._id || '');
			PAGE_Admin.importsDelete.attr('data-id', gallery._id || '');
			PAGE_Admin.importsName.attr('data-id', gallery._id || '');
			PAGE_Admin.importsAffiliation.attr('data-id', gallery._id || '');

			$('.import-byline-text').text(gallery.posts && gallery.posts[0] ? gallery.posts[0].byline : '').trigger('keydown');

			$('#import-byline-options').empty();
			var bylines = generateBylines(gallery.posts[0]);
			if (bylines.length > 1) {
				PAGE_Admin.importsBylineSelection.show();
				$('#import-byline-span').hide();
			}
			else {
				PAGE_Admin.importsBylineSelection.hide();
				$('#import-byline-span').show();
			}
			bylines.forEach(function(byline) {
				var elem = $('<li class="import-byline-type">' + byline + '</li>')
				elem.click(function() {
					$('.import-byline-text').text(byline);
					$('.byline-drop').removeClass('toggled');
				});
				$('#import-byline-options').append(elem);
			});

			if (!gallery.posts || !gallery.posts[0].meta.twitter) {
				PAGE_Admin.importsOtherOrigin.show();
				$('#import-byline-span').hide();
			}
			else {
				PAGE_Admin.importsOtherOrigin.hide();
			}

			$('.form-control').filter(function(){return this.value != '';}).trigger('keydown');
			$('.form-control').filter(function(){return this.value == '';}).trigger('keyup');
		}
	},
	setPolygon: function(map, coords){
		if (!coords)
			return map.polygon.setMap(null);
		
		coords = coords.map(function(a){ return new google.maps.LatLng(a[1], a[0]);});
		
		map.polygon.setPath(coords);
		map.marker.setPosition(map.polygon.getCentroid());
		map.marker.setMap(map.map);
		map.polygon.setMap(map.map);
		map.map.fitBounds(map.polygon.getBounds());
	},
	setMarker: function(map, location, radius){
		if (!location && !radius){
			if (map.circle) map.circle.setMap(null);
			return map.marker.setMap(null);
		}

		map.marker.setMap(map.map);
		map.marker.setPosition(location);

		if (radius && map.circle){
			map.circle.setMap(map.map);
			map.circle.setRadius(radius);
			map.circle.setCenter(location);
			map.map.fitBounds(map.circle.getBounds());
		}else{
			map.map.setCenter(location);
			map.map.setZoom(PAGE_Admin.MARKER_ZOOM_LEVEL);
		}
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
			center: new google.maps.LatLng(40.7, -74),
			zoom: 12,
			mapTypeControl: false,
			styles: styles
		};

		map.map = new google.maps.Map(document.getElementsByClassName(map.classes.container)[0], mapOptions);

		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};

		if (map.polygon !== undefined){
			map.polygon = new google.maps.Polygon({
					paths: [],
					strokeColor: "#FFB500",
					strokeOpacity: 0.8,
					strokeWeight: 0,
					fillColor: "#FFC600",
					fillOpacity: 0.35,
					map: null
				});
		}
		map.marker = new google.maps.Marker({
			position: new google.maps.LatLng(40.7, -74),
			map: null,
			icon: image
		});
		if (map.circle !== undefined) map.circle = new google.maps.Circle({
			map: null,
			center: new google.maps.LatLng(40.7, -74),
			radius: 1,

			strokeWeight: 0,
			fillColor: '#ffc600',
			fillOpacity: 0.26
		});

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
}

$(document).ready(function(){
	
	PAGE_Admin.initMap(PAGE_Admin.assignmentGoogleMap);
	PAGE_Admin.initMap(PAGE_Admin.importsGoogleMap);
	PAGE_Admin.initMap(PAGE_Admin.submissionGoogleMap);

	PAGE_Admin.assignmentTitle = $('.assignment-title');
	PAGE_Admin.assignmentCaption = $('.assignment-caption');
	PAGE_Admin.assignmentLocation = $('.assignment-location');
	PAGE_Admin.assignmentRadius = $('.assignment-radius');
	PAGE_Admin.assignmentHours = $('.assignment-hours');
	PAGE_Admin.assignmentApprove = $('.assignment-approve');
	PAGE_Admin.assignmentDeny = $('.assignment-deny');

	PAGE_Admin.submissionImages = $('.submission-images');
	PAGE_Admin.submissionCaption = $('.submission-caption');
	PAGE_Admin.submissionByline = $('.submission-byline');
	PAGE_Admin.submissionStoriesInput = $('.submission-stories-input');
	PAGE_Admin.submissionStories = $('.submission-stories');
	PAGE_Admin.submissionSuggestedStories = $('.submission-suggested-stories');
	PAGE_Admin.submissionTags = $('.submission-tags');
	PAGE_Admin.submissionSuggestedTags = $('.submission-suggested-tags');
	PAGE_Admin.submissionLocation = $('.submission-location');
	PAGE_Admin.submissionRevert = $('.submission-revert');
	PAGE_Admin.submissionVerify = $('.submission-verify');
	PAGE_Admin.submissionDelete = $('.submission-delete');
	PAGE_Admin.submissionSkip = $('.submission-skip');

	PAGE_Admin.importsImages = $('.import-images');
	PAGE_Admin.importsCaption = $('.import-caption');
	PAGE_Admin.importsByline = $('.import-byline');
	PAGE_Admin.importsStoriesInput = $('.import-stories-input');
	PAGE_Admin.importsStories = $('.import-stories');
	PAGE_Admin.importsSuggestedStories = $('.import-suggested-stories');
	PAGE_Admin.importsTags = $('.import-tags');
	PAGE_Admin.importsSuggestedTags = $('.import-suggested');
	PAGE_Admin.importsLocation = $('.import-location');
	PAGE_Admin.importsRevert = $('.import-revert');
	PAGE_Admin.importsSkip = $('.import-skip');
	PAGE_Admin.importsVerify = $('.import-verify');
	PAGE_Admin.importsDelete = $('.import-delete');
	PAGE_Admin.importsImportTwitter = $('.twitter-import');
	PAGE_Admin.importsImportLocal = $('.upload-import');
	PAGE_Admin.importsImportLocalFiles = $('.upload-import-files');
	PAGE_Admin.importsName = $('.import-name');
	PAGE_Admin.importsAffiliation = $('.import-affiliation');
	PAGE_Admin.importsOtherOrigin = $('.import-other-origin');
	PAGE_Admin.importsBylineText = $('.import-byline-text');
	PAGE_Admin.importsBylineSelection = $('#import-byline-selection');
	
	//Submissions Stories Autocomplete
	PAGE_Admin.submissionStoriesInput.typeahead({
		hint: true,
		highlight: true,
		minLength: 1,
		classNames: {
			menu: 'tt-menu shadow-z-2'
		}
	},
	{
		name: 'stories',
		display: 'title',
		source: function(query, syncResults, asyncResults){
			$.ajax({
				url: '/scripts/story/autocomplete',
				data: {
					q: query
				},
				success: function(result, status, xhr){
					asyncResults(result.data || []);
				},
				error: function(xhr, statur, error){
					asyncResults([]);
				}
			});
		},
		templates: {
			empty: [
				'<div class="story-empty-message tt-suggestion">',
					'Create new story',
				'</div>'
			].join('\n'),
		}
	}).on('typeahead:select', function(ev, story){
		var elem = makeTag(story.title);
		elem.data('id', story._id);
		if(PAGE_Admin.submissionStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(story._id) == -1)
			PAGE_Admin.submissionStories.append(elem);
		else
			$.snackbar({content: 'This gallery is already in that story!'});
			
		$(this).typeahead('val', '');
	}).on('keydown', function(ev){
		if (ev.keyCode == 13 && $('.story-empty-message').length == 1) {
			if($(this).val().indexOf('http://') != -1) {
				$.snackbar({content: 'No URLs please!'});
				return;
			}
			var elem = makeTag($(this).val());
			var id = 'NEW={"title":"' + $(this).val() + '"}';
			elem.data('id', id);
			elem.addClass('new-story');
			if(PAGE_Admin.submissionStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(id) == -1)
				PAGE_Admin.submissionStories.append(elem);
			else
				$.snackbar({content: 'This gallery is already in that story!'});
			$(this).typeahead('val', '');
		}
	});
	//Imports Stories Autocomplete
	PAGE_Admin.importsStoriesInput.typeahead({
		hint: true,
		highlight: true,
		minLength: 1,
		classNames: {
			menu: 'tt-menu shadow-z-2'
		}
	},
	{
		name: 'stories',
		display: 'title',
		source: function(query, syncResults, asyncResults){
			$.ajax({
				url: '/scripts/story/autocomplete',
				data: {
					q: query
				},
				success: function(result, status, xhr){
					asyncResults(result.data || []);
				},
				error: function(xhr, statur, error){
					asyncResults([]);
				}
			});
		},
		templates: {
			empty: [
				'<div class="story-empty-message tt-suggestion">',
					'Create new story',
				'</div>'
			].join('\n'),
		}
	}).on('typeahead:select', function(ev, story){
		var elem = makeTag(story.title);
		elem.data('id', story._id);
		if(PAGE_Admin.importsStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(story._id) == -1)
			PAGE_Admin.importsStories.append(elem);
		else
			$.snackbar({content: 'This gallery is already in that story!'});
			
		$(this).typeahead('val', '');
	}).on('keydown', function(ev){
		if (ev.keyCode == 13 && $('.story-empty-message').length == 1) {
			if($(this).val().indexOf('http://') != -1) {
				$.snackbar({content: 'No URLs please!'});
				return;
			}
			var elem = makeTag($(this).val());
			var id = 'NEW={"title":"' + $(this).val() + '"}';
			elem.data('id', id);
			elem.addClass('new-story');
			if(PAGE_Admin.importsStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(id) == -1)
				PAGE_Admin.importsStories.append(elem);
			else
				$.snackbar({content: 'This gallery is already in that story!'});
			$(this).typeahead('val', '');
		}
	});

	$('.tab-admin').click(function(){
		$('.tab, .tab-admin').removeClass('toggled');
		$(this).addClass('toggled');
		var tabval = $(this).data('tab');
		$('.tab-' + tabval).addClass('toggled');
		if (PAGE_Admin.load[tabval]) PAGE_Admin.load[tabval](); else console.log(PAGE_Admin.tab);
		PAGE_Admin.tab = tabval;

		if (PAGE_Admin.tab == 'assignments')
			PAGE_Admin.initMap(PAGE_Admin.assignmentGoogleMap);
		if (PAGE_Admin.tab == 'submissions')
			PAGE_Admin.initMap(PAGE_Admin.submissionGoogleMap);
		if (PAGE_Admin.tab == 'imports')
			PAGE_Admin.initMap(PAGE_Admin.importsGoogleMap);
	});

	PAGE_Admin.submissionVerify.click(function(){
		var gallery = null;
		var next_index = 0;
		for (var index in PAGE_Admin.submissions){
			if ($(this).attr('data-id') == PAGE_Admin.submissions[index]._id){
				gallery = PAGE_Admin.submissions[index];
				if (index == PAGE_Admin.submissions.length - 1)
					next_index = index - 1;
				else
					next_index = index;

				break;
			}
		}

		if (!gallery)
			return $.snackbar({content: 'Unable to verify gallery'});

		var tags = [],
			tagChips = PAGE_Admin.submissionTags.find('li.chip'),
			tagsChanged = tagChips.length != gallery.tags.length;

		tagChips.each(function(i){
			var tag = $(this).find('div.chip > span').text();
			tag = tag.substring(1, tag.length);

			if (tag != gallery.tags[i])
				tagsChanged = true;

			tags.push(tag);
		});

		var params = {
			id: gallery._id,
			byline: PAGE_Admin.submissionByline.val().trim(),
			posts: PAGE_Admin.submissionImages.frick('frickPosts'),
			stories: PAGE_Admin.submissionStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray(),
		};

		if (!params.posts || params.posts.length == 0)
			return $.snackbar({content: 'A gallery must have at least one post'});

		if(PAGE_Admin.submissionCaption.val().length == 0)
			return $.snackbar({content: 'A gallery must have a caption'});

		if (tagsChanged)
			params.tags = tags;

		if (PAGE_Admin.submissionCaption.val().trim() != gallery.caption)
			params.caption = PAGE_Admin.submissionCaption.val().trim();

		PAGE_Admin.Gallery.verify(params, function(err){
			if (err)
				return $.snackbar({content: 'Unable to verify gallery'});

			var id = PAGE_Admin.submissionVerify.attr('data-id');

			$.snackbar({content: 'Gallery verified! Click to open', timeout: 5000})
				.click(function(){
					window.open('/gallery/' + id);
				});
			PAGE_Admin.load.submissions(function(err){
				if(!err) $('.tab-submissions .list-item[data-index="' + next_index + '"]').click();
			});
			PAGE_Admin.autofill.submissions(null);
		});
	});
	PAGE_Admin.submissionDelete.click(function(){
		var _this = this;
		
		alertify.confirm("Are you sure you want to delete this gallery?", function (e) {
			if (!e)
				return;
			
			var next_index = 0;
			for (var index in PAGE_Admin.submissions){
				if ($(_this).attr('data-id') == PAGE_Admin.submissions[index]._id){
					if (index == PAGE_Admin.submissions.length - 1) {
						next_index = index - 1;
					}
					else{
						next_index = index;
					}
					break;
				}
			}
	
			PAGE_Admin.Gallery.delete($(_this).attr('data-id'), function(err){
				if (err)
					return $.snackbar({content: 'Unable to delete gallery'});
	
				//PAGE_Admin.autofill.submissions(null);
				PAGE_Admin.load.submissions(function(){
					if(!err) $('.tab-submissions .list-item[data-index="' + next_index + '"]').click();
				});
				$.snackbar({content: 'Gallery deleted'});
			});
		});
	});
	PAGE_Admin.submissionSkip.click(function(){
		var next_index = 0,
			id = $(this).attr('data-id');

		for (var index in PAGE_Admin.submissions){
			if (id == PAGE_Admin.submissions[index]._id){
				if (index == PAGE_Admin.submissions.length - 1) {
					next_index = index - 1;
				}
				else{
					next_index = index;
				}
				break;
			}
		}

		PAGE_Admin.Gallery.skip(id, function(err){
			if (err)
				return $.snackbar({content: 'Unable to skip gallery'});

			$.snackbar({content: 'Gallery skipped! Click to open', timeout: 5000})
				.click(function(){
					window.open('/gallery/' + id);
				});
			PAGE_Admin.autofill.submissions(null);
			PAGE_Admin.load.submissions(function(){
				if(!err) $('.tab-submissions .list-item[data-index="' + next_index + '"]').click();
			});
		});
	});
	PAGE_Admin.submissionRevert.click(function(){
		var original = null;

		for (var index in PAGE_Admin.submissions){
			if ($(this).attr('data-id') == PAGE_Admin.submissions[index]._id){
				original = PAGE_Admin.submissions[index];
				break;
			}
		}

		if (original)
			PAGE_Admin.autofill.submissions(original);
	});

	PAGE_Admin.assignmentApprove.click(function(){
		// if (assignmentGoogleMap.autocomplete.formatted_address == null)
		// 	return $.snackbar({content: 'Assignments must have location information'});

		var assignment = null,
			next_index = 0,
			params = { id: $(this).attr('data-id') };

		for (var index in PAGE_Admin.assignments){
			if (params.id == PAGE_Admin.assignments[index]._id){
				assignment = PAGE_Admin.assignments[index];
				if (index == PAGE_Admin.assignments.length - 1)
					next_index = index - 1;
				else
					next_index = index;

				break;
			}
		}

		if (!assignment)
			return $.snackbar({content: 'Unable to approve assignment'});

		if (PAGE_Admin.assignmentTitle.val().trim() != assignment.title)
			params.title = PAGE_Admin.assignmentTitle.val().trim();
		if (PAGE_Admin.assignmentCaption.val().trim() != assignment.caption)
			params.caption = PAGE_Admin.assignmentCaption.val().trim();
		if (PAGE_Admin.assignmentGoogleMap.autocomplete.formatted_address != assignment.location.googlemapsmaps)
			params.googlemaps = PAGE_Admin.assignmentGoogleMap.autocomplete.getPlace().formatted_address;
		if (parseInt(PAGE_Admin.assignmentRadius.val()) != milesToFeet(assignment.location.radius))
			params.radius = feetToMiles(parseInt(PAGE_Admin.assignmentRadius.val()));
		if (PAGE_Admin.assignmentGoogleMap.marker.getPosition().F != assignment.location.geo.coordinates[0] ||
			PAGE_Admin.assignmentGoogleMap.marker.getPosition().A != assignment.location.geo.coordinates[1]){
			params.lng = PAGE_Admin.assignmentGoogleMap.marker.getPosition().lng();
			params.lat = PAGE_Admin.assignmentGoogleMap.marker.getPosition().lat();
		}
		params.expiration_time = parseInt(PAGE_Admin.assignmentHours.val()) * 3600000;

		if (params.title === ''){
			return $.snackbar({content: 'Assignment must have a title'});
		}
		if (params.caption === ''){
			return $.snackbar({content: 'Assignment must have a caption'});
		}
		if(isNaN(params.expiration_time) || params.expiration_time <= 0){
			return $.snackbar({content: 'Expiration time must be a non-negative integer'});
		}

		PAGE_Admin.Assignment.approve(params, function(err){
			if (err)
				return $.snackbar({content: 'Error approving assignment: ' + resolveError(err)});

			$.snackbar({content: 'Assignment approved'});
		});
	});
	PAGE_Admin.assignmentDeny.click(function(){
		var id = $(this).attr('data-id');

		if (!id)
			return;

		PAGE_Admin.Assignment.deny(id, function(err){
			if (err)
				return $.snackbar({content: 'Error denying assignment: ' + resolveError(err)});

			$.snackbar({content: 'Assignment rejected'});
			PAGE_Admin.autofill.assignments(null);
			PAGE_Admin.load.assignments();
		});
	});

	PAGE_Admin.importsVerify.click(function(){
		var gallery = null;
		var next_index = 0;
		for (var index in PAGE_Admin.imports){
			if ($(this).attr('data-id') == PAGE_Admin.imports[index]._id){
				gallery = PAGE_Admin.imports[index];
				if (index == PAGE_Admin.imports.length - 1)
					next_index = index - 1;
				else
					next_index = index;

				break;
			}
		}

		if (!gallery)
			return $.snackbar({content: 'Unable to verify gallery'});

		if(PAGE_Admin.submissionCaption.val().length == 0)
			return $.snackbar({content: 'A gallery must have a caption'});

		var tags = [],
			tagChips = PAGE_Admin.importsTags.find('li.chip'),
			tagsChanged = tagChips.length != gallery.tags.length;

		tagChips.each(function(i){
			var tag = $(this).find('div.chip > span').text();
			tag = tag.substring(1, tag.length);

			if (tag != gallery.tags[i])
				tagsChanged = true;

			tags.push(tag);
		});

		var params = {
			id: gallery._id,
			byline: PAGE_Admin.importsBylineText.eq(0).text().trim(),
			posts: PAGE_Admin.importsImages.frick('frickPosts'),
			stories: PAGE_Admin.importsStories.children('li.chip').map(function(elem){return $(this).data('id')}).toArray(),
		};
		
		if (PAGE_Admin.importsOtherOrigin.css('display') !== 'none') {

			if(PAGE_Admin.importsName.val().length == 0 || PAGE_Admin.importsAffiliation.val().length == 0)
				return $.snackbar({content: 'A gallery must have a byline'});

			params.byline = PAGE_Admin.importsName.val().trim() + ' / ' + PAGE_Admin.importsAffiliation.val().trim();
			params.other_origin_name = PAGE_Admin.importsName.val().trim();
			params.other_origin_affiliation = PAGE_Admin.importsAffiliation.val().trim();

		}

		if (tagsChanged)
			params.tags = tags;

		if (PAGE_Admin.importsCaption.val().trim() != gallery.caption)
			params.caption = PAGE_Admin.importsCaption.val().trim();

		// var coord = PAGE_Admin.importsGoogleMap.marker.getPosition();
		// params.lat = coord ? coord.lat() : null;
		// params.lon = coord ? coord.lng() : null;
		// if(PAGE_Admin.importsLocation.val())	
		// 	params.address = PAGE_Admin.importsLocation.val();

		if (!params.posts || params.posts.length == 0)
			return $.snackbar({content: 'A gallery must have at least one post'});

		PAGE_Admin.Gallery.verify(params, function(err){
			if (err)
				return $.snackbar({content: 'Unable to verify gallery'});

			var id = PAGE_Admin.importsVerify.attr('data-id');

			$.snackbar({content: 'Gallery verified! Click to open', timeout: 5000})
				.click(function(){
					window.open('/gallery/' + id);
				});
			PAGE_Admin.load.imports(function(err){
				if(!err) $('.tab-imports .list-item[data-index="' + next_index + '"]').click();
			});
			PAGE_Admin.autofill.imports(null);
		});
	});
	PAGE_Admin.importsSkip.click(function(){
		var next_index = 0,
			id = $(this).attr('data-id');

		for (var index in PAGE_Admin.imports){
			if (id == PAGE_Admin.imports[index]._id){
				if (index == PAGE_Admin.imports.length - 1) {
					next_index = index - 1;
				}
				else{
					next_index = index;
				}
				break;
			}
		}

		PAGE_Admin.Gallery.skip(id, function(err){
			if (err)
				return $.snackbar({content: 'Unable to skip gallery'});

			$.snackbar({content: 'Gallery skipped! Click to open', timeout: 5000})
				.click(function(){
					window.open('/gallery/' + id);
				});
			//PAGE_Admin.autofill.imports(null);
			PAGE_Admin.load.imports(function(){
				if(!err) 
					$('.tab-imports .list-item[data-index="' + next_index + '"]').click();
			});
		});
	});
	PAGE_Admin.importsRevert.click(function(){
		var original = null;

		for (var index in PAGE_Admin.imports){
			if ($(this).attr('data-id') == PAGE_Admin.imports[index]._id){
				original = PAGE_Admin.imports[index];
				break;
			}
		}

		if (original)
			PAGE_Admin.autofill.imports(original);
	});
	PAGE_Admin.importsDelete.click(function(e){
		var _this = this;
		
		alertify.confirm("Are you sure you want to delete this gallery?", function (e) {
			if (!e)
				return;
			
			var next_index = 0;
			for (var index in PAGE_Admin.imports){
				if ($(_this).attr('data-id') == PAGE_Admin.imports[index]._id){
					if (index == PAGE_Admin.imports.length - 1) {
						next_index = index - 1;
					}
					else{
						next_index = index;
					}
					break;
				}
			}
	
			PAGE_Admin.Gallery.delete($(_this).attr('data-id'), function(err){
				if (err)
					return $.snackbar({content: resolveError(err)});
	
				//PAGE_Admin.autofill.imports(null);
				PAGE_Admin.load.imports(function(){
					if(!err) $('.tab-imports .list-item[data-index="' + next_index + '"]').click();
				});
				$.snackbar({content: 'Gallery deleted'});
			});
		});
	});
	PAGE_Admin.importsImportLocal.click(function(e){
		PAGE_Admin.importsImportLocalFiles.trigger('click');
	});
	PAGE_Admin.importsImportLocalFiles.change(function(e){
		var data = new FormData(),
			files = PAGE_Admin.importsImportLocalFiles.prop('files');

		for (var index in files)
			data.append(index, files[index]);

		data.append('caption', 'Gallery imported from local system on ' + moment().format('MMMM Do YYYY, h:mm:ss a'));

		PAGE_Admin.Gallery.import(data, function(err, gallery){
			if (err)
				return $.snackbar({content: 'Failed to import media'});

			resetFileElement(PAGE_Admin.importsImportLocalFiles);

			$('.tab-admin[data-tab="imports"]').click();
			PAGE_Admin.load.imports(function(){
				var index = null;

				for (var i in PAGE_Admin.imports)
					if (gallery._id == PAGE_Admin.imports[i]._id)
						index = i;

				if (index)
					$('.tab-imports .list-item[data-index="' + index + '"]').click();
			});
		});
	});
	PAGE_Admin.importsImportTwitter.keypress(function(e){
		if (e.which != 13) return;
		var data = new FormData();

		data.append('tweet', $(this).val());

		PAGE_Admin.Gallery.import(data, function(err, gallery){
			if (err){
					switch(err){
						case "ERR_DUPLICATE_TWEET":
							PAGE_Admin.importsImportTwitter.val('');
							return $.snackbar({content: 'This tweet has already been imported'});
						default:
							return $.snackbar({content: 'Failed to import media: ' + resolveError(err)});
					}
			}else{
				PAGE_Admin.importsImportTwitter.val('');
			}

			$(this).val('');
			$('.tab-admin[data-tab="imports"]').click();
			PAGE_Admin.load.imports(function(){
				var index = null;

				for (var i in PAGE_Admin.imports)
					if (gallery._id == PAGE_Admin.imports[i]._id)
						index = i;

				if (index)
					$('.tab-imports .list-item[data-index="' + index + '"]').click();
			});
		});
	});

	setInterval(function(){
		var list = $('.tab.toggled > .list'),
			scroll = list.scrollTop();
		if (PAGE_Admin.load[PAGE_Admin.tab]) PAGE_Admin.load[PAGE_Admin.tab](function(){
			list.scrollTop(scroll);
		}); else console.log(PAGE_Admin.tab);
	}, 5000);

	$('button[data-tab="assignments"]').click();
});
