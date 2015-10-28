if (google)
google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;        
    for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
        }
    }
    return bounds;
}

$(document).ready(function(){
	$.material.init();
	
	// drawer
	$(".toggle-drawer.toggler").click(function() {
		$(".toggle-drawer").toggleClass("toggled");
	});
	// navbar drops
	$(".toggle-drop").click(function() {
		var drop =  $(this).siblings(".drop-menu");
		drop.toggleClass("toggled");
		if (drop.hasClass("toggled")) {
			var offset = drop.offset().left;
			while (offset + drop.outerWidth() > $(window).width() - 7) {
				drop.css("left", parseInt(drop.css("left")) - 1 + "px");
				offset = drop.offset().left;
			}
		}
		$(".dim.toggle-drop").toggleClass("toggled");
	});
	$(".toggle-drop.toggler").click(function() {
		$(".drop-menu").removeClass("toggled");
	});
	// tabs
	$(".related > .tab-control > button").click(function() {
		$(this).siblings().removeClass("toggled");
		$(this).toggleClass("toggled");
		$(this).parent().next().children(".tab").removeClass("toggled");
		if ($(this).hasClass("toggled")) {
			$(this).parent().next().children(".tab").eq($(this).index()).addClass("toggled");
		}
	});
	$(".card .tab-control > button").click(function() {
		$(this).siblings().removeClass("toggled");
		$(this).toggleClass("toggled");
		$(this).parents(".card-head").siblings(".card-body").find(".tab").removeClass("toggled");
		if ($(this).hasClass("toggled")) {
			$(this).parents(".card-head").siblings(".card-body").find(".tab").eq($(this).index()).addClass("toggled");
		}
	});
	// bulk selection
	$(".tile").click(function(event) {
		if (event.shiftKey && !$(this).hasClass("story") && $(this).find('.mdi-library-plus').length > 0) {
			$(this).toggleClass("toggled");
			$(this).find(".tile-body > .img-responsive").toggleClass("toggled");
			$(this).find(".tile-foot").toggleClass("toggled");
			if ($(".tile").hasClass("toggled")) {
				$(".bulk").addClass("toggled");
			} else {
				$(".bulk").removeClass("toggled");
			}
		}
	});
	$("#clear").click(function(event) {
		$(".bulk").removeClass("toggled");
		$(".tile").removeClass("toggled");
		$(".tile-body > .img-responsive").removeClass("toggled");
		$(".tile-foot").removeClass("toggled");
	});
	// edit
	$(".toggle-edit.toggler").click(function() {
		$(".toggle-edit").toggleClass("toggled");
	});
	$(".toggle-aedit.toggler").click(function() {
		$(".toggle-aedit").toggleClass("toggled");
	});
	$(".toggle-gcreate.toggler").click(function() {
		$(".toggle-gcreate").toggleClass("toggled");
	});
	$(".toggle-gedit.toggler").click(function() {
		$(".toggle-gedit").toggleClass("toggled");
	});
	$(".toggle-sedit.toggler").click(function() {
		$(".toggle-sedit").toggleClass("toggled");
	});
	$(".toggle-aradd.toggler").click(function() {
		$(".toggle-aradd").toggleClass("toggled");
	});
	// sidebar
	$("#sidebar-dispatch").click(function(){
		window.location.assign("/dispatch");
	});
	// sidebar
	$("#sidebar-highlights").click(function(){
		window.location.assign("/highlights");
	});
	// sidebar
	$("#sidebar-all").click(function(){
		window.location.assign("/content");
	});
	// sidebar
	$("#sidebar-images").click(function(){
		window.location.assign("/content/images");
	});
	// sidebar
	$("#sidebar-videos").click(function(){
		window.location.assign("/content/videos");
	});
	// sidebar
	$("#sidebar-galleries").click(function(){
		window.location.assign("/content/galleries");
	});
	// sidebar
	$("#sidebar-stories").click(function(){
		window.location.assign("/content/stories");
	});
	// sidebar
	$("#sidebar-admin").click(function(){
		window.location.assign("/admin");
	});
	// sidebar
	$("#sidebar-outlet").click(function(){
		window.location.assign("/outlet");
	});
	// sidebar
	$("#sidebar-purchases").click(function(){
		window.location.assign("/purchases");
	});
	
	//Gallery edit mappings
	$('#gallery-revert-button').click(galleryEditUpdate);
	$('#gallery-clear-button').click(galleryEditClear);
	$('#gallery-add-more-button').click(galleryEditAddMore);
	$('#gallery-discard-button').click(galleryEditClear);
	$('#gallery-delete-button').click(galleryEditDelete);
	$('#gallery-save-button').click(galleryEditSave);
	$('#gallery-upload-files').change(galleryEditFiles);
	$('.toggle-gedit.toggler').click(galleryEditUpdate);

	if(GALLERY_EDIT && !GALLERY_EDIT.imported) {
		$('#gallery-add-more-button').remove();
	}

	//Gallery save mappings
	$('#gallery-create-clear-button').click(galleryCreateClear);
	$('#gallery-create-discard-button').click(galleryCreateClear);
	$('#gallery-create-save-button').click(galleryCreateSave);

	//Set up the create gallery tags view
	$('#gallery-create-tags-list').empty();
	$('#gallery-create-tags-input').on('change', function(){
		if ($(this).val() === '') return;
		$('#gallery-create-tags-list').append(makeTag('#' + $(this).val()));
		$(this).val('').trigger('keyup');
	});

	//Set up the edit gallery tags view
	$('#gallery-tags-list').empty();
	$('#gallery-tags-input').on('change', function(){
		if ($(this).val() === '') return;
		$('#gallery-tags-list').append(makeTag('#' + $(this).val()));
		$(this).val('').trigger('keyup');
	});

	// function storyTokenizer(datum){
	// 	var titleTokenizer = Bloodhound.tokenizers.obj.whitespace(datum.title);
	// 	var captionTokenizer = Bloodhound.tokenizers.obj.whitespace(datum.caption);
	// 	return titleTokenizer.concat(captionTokenizer);
	// }

	// var storySearcher = new Bloodhound({
	// 	datumTokenizer: storyTokenizer,
	// 	queryTokenizer: Bloodhound.tokenizers.whitespace,
	// 	remote: {
	// 		url: '/scripts/story/autocomplete?q=%QUERY',
	// 		wildcard: '%QUERY',
	// 		transform: function(res){
	// 			return res.data;
	// 		},
	// 		identify: function(datum){
	// 			return datum._id;
	// 		}
	// 	},
	// });
	
	//Following buttons
	$('.btn-follow, .btn-unfollow').on('click', function(e){
		var self = $(this),
			other = self.data('id'),
			type = self.data('type');

		$.ajax({
			url: '/scripts/user/' + (self.hasClass('btn-follow') ? 'follow' : 'unfollow'),
			dataType: 'json',
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({
				other: other,
				type: type
			}),
			success: function(result){
				if (result.err) return this.error(null, null, result.err);

				self.toggleClass('btn-follow');
				self.toggleClass('btn-unfollow');
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	});

	//Gallery Stories Autocomplete
	$('#gallery-stories-input').typeahead({
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
		if($('#gallery-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(story._id) == -1)
			$('#gallery-stories-list').append(elem);
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
			if($('#gallery-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(id) == -1)
				$('#gallery-stories-list').append(elem);
			else
				$.snackbar({content: 'This gallery is already in that story!'});
			$(this).typeahead('val', '');
		}
	});

	$('#gallery-articles-input').typeahead({
		hint: true,
		highlight: true,
		minLength: 1,
		classNames: {
			menu: 'tt-menu shadow-z-2',
			suggestion: 'article-suggestion'
		}
	},
	{
		name: 'articles',
		display: 'link',
		source: function(query, syncResults, asyncResults){
			$.ajax({
				url: '/scripts/article/search',
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
				'<div class="article-empty-message tt-suggestion">',
					'Create new article',
				'</div>'
			].join('\n'),
		}
	}).on('typeahead:select', function(ev, article){
		var elem = makeTag(article.link);
		elem.data('id', article._id);
		$('#gallery-articles-list').append(elem);
		$(this).typeahead('val', '');
	}).on('keydown', function(ev){
		if (ev.keyCode == 13 && $('.article-empty-message').length == 1) {
			var elem = makeTag($(this).val());
			elem.data('id', 'NEW={"link":"' + $(this).val() + '"}');
			elem.addClass('new-story');
			$('#gallery-articles-list').append(elem);
			$(this).typeahead('val', '');
		}
	});

	$('#gallery-create-stories-input').typeahead({
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
		if($('#gallery-create-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(story._id) == -1)
			$('#gallery-create-stories-list').append(elem);
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
			if($('#gallery-create-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray().indexOf(id) == -1)
				$('#gallery-create-stories-list').append(elem);
			else
				$.snackbar({content: 'This gallery is already in that story!'});
			$(this).typeahead('val', '');
		}
	});

	$('#gallery-create-articles-input').typeahead({
		hint: true,
		highlight: true,
		minLength: 1,
		classNames: {
			menu: 'tt-menu shadow-z-2',
			suggestion: 'article-suggestion'
		}
	},
	{
		name: 'articles',
		display: 'link',
		source: function(query, syncResults, asyncResults){
			$.ajax({
				url: '/scripts/article/search',
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
				'<div class="article-empty-message tt-suggestion">',
					'Create new article',
				'</div>'
			].join('\n'),
		}
	}).on('typeahead:select', function(ev, article){
		var elem = makeTag(article.link);
		elem.data('id', article._id);
		$('#gallery-create-articles-list').append(elem);
		$(this).typeahead('val', '');
	}).on('keydown', function(ev){
		if (ev.keyCode == 13 && $('.article-empty-message').length == 1) {
			var elem = makeTag($(this).val());
			elem.data('id', 'NEW={"link":"' + $(this).val() + '"}');
			elem.addClass('new-story');
			$('#gallery-create-articles-list').append(elem);
			$(this).typeahead('val', '');
		}
	});

	//Clear bulk selection
	$('#bulk-clear-button').click(function(){
		$('.tile.toggled').each(function(i, elem){
			toggleSelected(elem, {});
		});
		selectedPosts.length = 0;
	});
	//Download selected
	$('#bulk-download-button').click(function(){
		bulkPurchase();
	});
	//Edit selected
	$('#bulk-edit-button').click(function(){
		editorUpdate(selectedPosts[0]);
	});

	$('#edit-revert-button').click(function(){
		editorUpdate(selectedPosts[0]);
	});
	$('#edit-clear-button').click(function(){
		editorClear();
	});
	$('#edit-save-button').click(function(){
		editorSave(selectedPosts[0]);
	});

	//Tag inputs
	$('.tags-input').on('keydown', function(e){
		if (e.which == 13 || e.which == 32 || e.which == 188){
			if ($(this).val().trim() == '') return;
			$(this).parent().siblings('ul.tags').append(makeTag('#' + $(this).val().trim()));
			$(this).val('');
			$(this).trigger('keyup');
			return false;
		}
	});
	
	$('#sidebar-search').keypress(function(e) {
		if(e.which == 13 && $(this).val().trim() !== '') {
			var qstr = $(this).val().split(' '),
				tags = [],
				query = [];
			
			for (var index in qstr){
				if (qstr[index][0] === '#' )
					tags.push(qstr[index].substr(1, qstr[index].length));
				else
					query.push(qstr[index]);
			}
			
			window.location.assign('/search?q=' + query.join(' ') + (tags.length > 0 ? '&tags=' + tags.join(',') : ''));
		}
	});
});

//Post selected via multiselect
var GALLERY_EDIT = null,
	selectedPosts = [],
	edit_initial_toggle = true,
	edit_map = null,
	edit_marker = null;

//AJAX - Create new gallery
function createGallery(caption, tags, posts, highlight, articles, stories, callback){
	var params = {
		caption: caption,
		posts: posts,
		tags: tags,
		visibility: highlight ? 2 : 1,
		articles: articles,
		stories: stories,
	};
	$.ajax("/scripts/gallery/create", {
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(params),
		success: function(result){
			if(result.err){
				return callback(result.err, null);
			};
			callback(null, result.data);
		},
		error: function(xhr, status, error){
			callback(error, null);
		}
	});
}
//AJAX - Update the gallery
function updateGallery(caption, byline, tags, posts, highlight, callback){
	var params = {
		caption: caption,
		byline: byline,
		posts: posts,
		visibility: highlight ? 2 : GALLERY_EDIT.visibility,
		tags: tags,
		id: GALLERY_EDIT._id,
		stories: $('#gallery-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray(),
		articles: $('#gallery-articles-list li.chip').map(function(elem){return $(this).data('id')}).toArray(),
	};

	if(GALLERY_EDIT.visibility == 2 && !highlight){
		params.visibility = 1;
	}

	$.ajax("/scripts/gallery/update", {
		method: 'post',
		contentType: "application/json",
		data: JSON.stringify(params),
		success: function(result){
			callback(result.err, result.data);
		},
		error: function(xhr, status, error){
			callback(error, null);
		}
	});
}

function circleToPolygon(circle, numSides){
	var center = circle.getCenter(),
		topleft = circle.getBounds().getNorthEast(),
  		radiusX = Math.abs(topleft.lat() - center.lat()),
  		radiusY = Math.abs(topleft.lng() - center.lng()),
  		points = [],
		degreeStep = Math.PI * 2 / numSides;
		
	for(var i = 0; i < numSides; i++){
		//var gpos = google.maps.geometry.spherical.computeOffset(center, radius, degreeStep * i);
		points.push([center.lng() + radiusY * Math.sin(i * degreeStep), center.lat() + radiusX * Math.cos(i * degreeStep)]);
	};

	// Duplicate the last point to close the geojson ring
	points.push(points[0]);

	return [ points ];
}

//AJAX - Purchase selected posts
function bulkPurchase(assignment){
	var postIDs = [],
		index = 0;

	selectedPosts.forEach(function(post){
		postIDs[index] = post._id;
		++index;
	});

	if (postIDs.length == 0) return;

	alertify.confirm("Are you sure you want to purchase? This will charge your account.", function (e) {
	    if (e) {
			$.ajax({
				url: '/scripts/outlet/checkout',
				dataType: 'json',
				method: 'post',
				contentType: "application/json",
				data: JSON.stringify({
					assignment: assignment,
					posts: postIDs
				}),
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					$.snackbar({htmlAllowed: true,content:'Purchase successful! Visit your <a style="color:white;" href="/outlet">outlet page</a> to view your purchased content',timeout:0});
					$('.tile.toggled').find('.mdi-cash').remove();
					$('.tile.toggled').find('.mdi-library-plus').remove();
					$('.tile.toggled').find('.mdi-file-image-box').addClass('available');
					$('.tile.toggled').find('.mdi-movie').addClass('available');
					$('.tile.toggled').each(function(i, elem){
						toggleSelected(elem, {});
					});
				},
				error: function(xhr, status, error){
					if (error == 'ERR_INCOMPLETE')
						$.snackbar({content:'Some of your purchases were unable to be processed',timeout:0});
					else
						$.snackbar({content:resolveError(error)});
				}
			});
	    } else {
	        // user clicked "cancel"
	    }
	});
}

//Clears the editor
function editorClear(){
	$('.dialog-body input').val('').trigger('keyup');
	$('#edit-caption-input').val('').trigger('keyup');
	$('#edit-tags-list').empty();
	$('#edit-articles-list').empty();
}

function editorSave(post){

}

function editorUpdate(post){
	if(edit_initial_toggle){
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

		edit_map = new google.maps.Map(document.getElementById('edit-map-canvas'), mapOptions);

		var image = {
			url: "/images/assignment-user@2x.png",
			size: new google.maps.Size(70, 70),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(35, 35)
		};

		edit_marker = new google.maps.Marker({
			position: new google.maps.LatLng(40.7, -74),
			map: edit_map,
			icon: image
		});

		var autocomplete = new google.maps.places.Autocomplete(document.getElementById('edit-location-input'));
		$('#edit-location-input').attr('placeholder', '');
		google.maps.event.addListener(autocomplete, 'place_changed', function(){
			var place = autocomplete.getPlace();

			if(place.geometry){
				if(place.geometry.viewport){
					edit_map.fitBounds(place.geometry.viewport);
				}
				else{
					edit_map.panTo(place.geometry.location);
					edit_map.setZoom(18);
				}
			}
			else{
				console.log("incorrect place");
			}
		});

		edit_initial_toggle = false;
	}
	
	if (post.location.geo){
		var lat = post.location.geo.coordinates[1];
		var lng = post.location.geo.coordinates[0];
	
		edit_marker.setMap(edit_map);
		edit_marker.setPosition(new google.maps.LatLng(lat, lng));
		edit_map.setCenter(edit_marker.getPosition());
		edit_map.setZoom(18);
	}else{
		edit_marker.setMap(null);
	}

	$('#edit-tags-list').empty();
	$('#edit-tags-input').on('change', function(){
		if ($(this).val() === '') return;
		$('#edit-tags-list').append(makeTag('#' + $(this).val()));
		$(this).val('').trigger('keyup');
	});
	if (GALLERY_EDIT) post.tags = GALLERY_EDIT.tags;
	post.tags.forEach(function(tag){
		$('#edit-tags-list').append(makeTag('#' + tag));
	});

	$('#edit-articles-list').empty();
	$('#edit-articles-input').on('change', function(){
		if ($(this).val() === '') return;
		$('#edit-articles-list').append(makeTag($(this).val()));
		$(this).val('').trigger('keyup');
	});
	if (GALLERY_EDIT) post.articles = GALLERY_EDIT.articles;
	post.articles.forEach(function(tag){
		$('#edit-articles-list').append(makeTag(tag));
	});

	if(post.visibility && post.visibility < 1){
		$('#edit-subhead').append($('<li><span class="mdi mdi-alert-circle icon"></span>Not yet verified</li>'));
	}
	$('#edit-owner').text(post.byline);
	$('#edit-location').text(post.location_label);
	$('#edit-image').attr('src', formatImg(post.image, 'small'));
	$('#edit-license').text(post.license);
	$('#edit-caption').text(post.caption || '');
	$('#edit-caption-input').val(post.caption || '').trigger('keydown');
	$('#edit-name-input').val(post.byline).trigger('keydown');
	$('#edit-affiliation-input').val(post.license).trigger('keydown');
	$('#edit-owner-image').attr('src', post.owner.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png');
	$('#edit-source').css({display: 'none'});
	$('#edit-source-link').attr('href', post.source);
}

//Create a DOM representation of a tag
function makeTag(tag, plus){
	plus = !!plus;
	var tagText = '<li class="chip">' +
	'	<div class="chip">' +
	'		<div class="icon">' +
	'			<span class="mdi ' + (plus ? 'mdi-plus' : 'mdi-minus') +' icon md-type-subhead"></span>' +
	'		</div>' +
	'		<span class="chip md-type-body1 tag">' + tag + '</span>' +
	'	</div>' +
	'</li>';
	var elem = $(tagText);
	elem.click(function(){
		$(this).remove();
	})
	return elem;
}

//Toggles the selected state of the given post
function toggleSelected(tile, post){
	$(tile).toggleClass("toggled");
	$(tile).find(".tile-body > .img-responsive").toggleClass("toggled");
	$(tile).find(".tile-foot").toggleClass("toggled");
	if ($(".tile").hasClass("toggled")) {
		$(".bulk").addClass("toggled");
	} else {
		$(".bulk").removeClass("toggled");
	}
	if ($(tile).hasClass("toggled")) {
		selectedPosts.push(post);
	}
	else {
		selectedPosts.splice(selectedPosts.indexOf(post), 1);
	}
	refreshBulkThumbs();
}
//Refreshes the list of selected
function refreshBulkThumbs(){
	$('#bulk-thumbs').empty();
	selectedPosts.forEach(function(post){
		var elemText = '<a class="thumb" href=""><img class="img-responsive" src="' + formatImg(post.image, 'small') + '"></a>';
		var elem = $(elemText);
		$('#bulk-thumbs').append(elem);
	});
	if(selectedPosts.length == 1)
		$('#post-count').text('1 Post');
	else
		$('#post-count').text(selectedPosts.length + ' Posts');

	if (selectedPosts.length === 0) {
		$('#global-edit-button').removeClass('toggler');
	}
	else {
		$('#global-edit-button').addClass('toggler');
	}
}

//Builds a DOM representation of a post with the given post object
function buildPost(post, purchased, size, forsale, timeType){
	if (!post) return '';

	var sizes = {
		large: 'col-xs-12 col-sm-6 col-lg-4 tile',
		small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2 tile'
	};

	var icons = '';

	// if(typeof rank !== 'undefined' && rank >= 1) {
	// 	if(typeof outlet !== 'undefined' && !purchased){
	// 		icons = '<span class="mdi mdi-pencil icon pull-right toggle-gedit toggler"></span><span class="mdi mdi-download icon pull-right"></span><span class="mdi mdi-cash icon pull-right" data-id="' + post._id + '"></span>';
	// 	}
	// 	else{
	// 		icons = '<span class="mdi mdi-pencil icon pull-right toggle-gedit toggler"></span><span class="mdi mdi-download icon pull-right"></span>';
	// 	}
	// }
	// else if (purchased || !forsale) {
	// 	icons = '<span class="mdi mdi-download icon pull-right"></span>'
	// }
	// else if (post.license == 'Fresco News'){
	// 	icons = '<span class="mdi mdi-library-plus icon pull-right"></span><span class="mdi mdi-cash icon pull-right" data-id="' + post._id + '"></span>'
	// }
	
	if (purchased !== null){
		if(typeof rank !== 'undefined' && rank >= 1) {
			if(purchased === false){
				icons = '<span class="mdi mdi-pencil icon pull-right toggle-gedit toggler"></span><span class="mdi mdi-download icon pull-right"></span><span class="mdi mdi-cash icon pull-right" data-id="' + post._id + '"></span>';
			}else{
				icons = '<span class="mdi mdi-pencil icon pull-right toggle-gedit toggler"></span><span class="mdi mdi-download icon pull-right"></span>';
			}
		}
		else if (purchased === true){
			icons = '<span class="mdi mdi-download icon pull-right"></span>'
		}
		else if (purchased == false && forsale) {
			icons = '<span class="mdi mdi-library-plus icon pull-right"></span><span class="mdi mdi-cash icon pull-right" data-id="' + post._id + '"></span>'
		}
	}
	
	var timestamp = timeType == 'captured' ? post.time_captured : post.time_created;
	
	var timeString = getTimeAgo(Date.now(), timestamp);
	
	var elem = $('\
	<div class="' + sizes[size || 'medium'] + ' tile">\
		<div class="tile-body">\
			<div class="frame">\
			</div>\
				<div class="hover">\
					<p class="md-type-body1">'+ (post.caption || '') + '</p>\
					<span class="md-type-caption">' + (post.byline || '') + '</span>'
					 + (post.related_stories && post.related_stories.length > 0 ? '<ul class="story-list"></ul>' : '') +
				'</div>\
			<div class="img">\
				<img class="img-cover">\
			</div>\
		</div>\
		<div class="tile-foot">\
			<div class="hover">\
			<a class="md-type-body2 post-link" href="/post/'+post._id+'">See more</a>'
				+ icons +
			'</div>\
			<div>\
				<div class="tile-info">\
					   <span class="md-type-body2">' + (post.location.address || 'No Location') + '</span>\
					   <span class="md-type-caption timestring" data-timestamp="' + timestamp + '">' + timeString + '</span>\
				</div>\
				<span class="mdi ' + (post.video == null ? "mdi-file-image-box" : 'mdi-movie') + ' icon ' + (purchased ? 'available' : 'md-type-black-disabled') + ' pull-right"></span>\
			</div>\
		</div>\
	</div>');

	attachOnImageLoadError(elem.find('img.img-cover'));
	elem.find('img.img-cover').prop('src',formatImg(post.image, 'small'));
	elem.find('.tile-body').click(function(event){
		if(event.shiftKey) return;
		window.location.assign('/post/' + post._id)
	}).css('cursor', 'pointer');
	elem.click(function(event) {
		//if (event.shiftKey && !$(this).hasClass("story") && $(this).find('.mdi-library-plus').length > 0) {
		if (event.shiftKey && !$(this).hasClass("story")) {
			toggleSelected(this, post);
		}
	});
	if (forsale) elem.find('.mdi-library-plus').click(function(){
		toggleSelected(elem, post);
	});
	elem.find('.mdi-pencil').click(function(){
		$.ajax({
			url: '/scripts/post/gallery',
			type: 'GET',
			data: {id: post._id},
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
				
				GALLERY_EDIT = result.data;
				galleryEditUpdate();
				$(".toggle-gedit").toggleClass("toggled");
			},
			error: function(xhr, status, error){
				$.snackbar({content:resolveError(error)});
			}
		})
	});
	elem.find('.mdi-download').click(function(){
		var href = post.video ? post.video.replace('videos/','videos/mp4/').replace('.m3u8','.mp4') : post.image;
		var link = document.createElement("a");
	    link.download = Date.now() + '.' + href.split('.').pop();
	    link.href = href;
	    link.click();
	});
	elem.find('.mdi-cash').click(function(e){
		var thisElem = $(this),
			post = $(this).attr('data-id');

		if (!post)
			return $.snackbar({content:'Invalid post'});

		alertify.confirm("Are you sure you want to purchase? This will charge your account.\nContent from members of your outlet may be purchased free of charge.", function (e) {
		    if (e) {
				var assignment = null;
				if(typeof PAGE_Assignment !== 'undefined'){
					assignment = PAGE_Assignment.assignment;
				}
				$.ajax({
					url: '/scripts/outlet/checkout',
					dataType: 'json',
					method: 'post',
					contentType: "application/json",
					data: JSON.stringify({
						posts: [post],
						assignment: (assignment ? assignment._id : null)
					}),
					success: function(result, status, xhr){
						if (result.err)
							return this.error(null, null, result.err);

						$.snackbar({content:'Purchase successful! Visit your <a style="color:white;" href="/outlet">outlet page</a> to view your purchased content', timeout:0});

						var card = thisElem.parents('tile');
						thisElem.siblings('.mdi-library-plus').remove();
						thisElem.parent().parent().find('.mdi-file-image-box').addClass('available');
						thisElem.parent().parent().find('.mdi-movie').addClass('available');
						card.removeClass('toggled');
						thisElem.remove();
					},
					error: function(xhr, status, error){
						if (error == 'ERR_INCOMPLETE')
							$.snackbar({content:'There was an error while completing your purchase!'});
						else
							$.snackbar({content:resolveError(error)});
					}
				});
		    } else {
		        // user clicked "cancel"
		    }
		});
	});

	if(post.stories){
		post.stories.forEach(function(story, index) {
			if (index >= 3) return;
			var storyLink = $('<li>' + story.title + '</li>');
			storyLink.click(function(){
				window.location.assign('/story/' + story._id);
			})
			elem.find('.story-list').append(storyLink);
		}, this);
	}

	return elem;
}

function setTimeDisplayType(timeDisplay) {
	$('.timestring').each(function() {
		var timestamp = $(this).data('timestamp');
	
		var timeString = '';
		if (timeDisplay == 'absolute') {
			timeString = timestampToDate(timestamp);
		} else {
			timeString = getTimeAgo(Date.now(), timestamp);
		}
		$(this).text(timeString);
	});
}

//Save gallery edits
function galleryEditSave(){
	var caption = $('#gallery-caption-input').val();
	var byline = $('#gallery-byline-input').val();
	var tags = $('#gallery-tags-list .tag').text().split('#').filter(function(t){ return t.length > 0; });
	var posts = $('.edit-gallery-images').frick('frickPosts');
	
	var added = posts.filter(function(id) {return id.indexOf('NEW') !== -1});
	added = added.map(function(index) {
		index = index.split('=')[1];
		return GALLERY_EDIT.files[index];
	});
	
	posts = posts.filter(function(id) {return id.indexOf('NEW') == -1});

	if (posts.length == 0)
		return $.snackbar({content:"Galleries must have at least 1 post"});

	var highlight = GALLERY_EDIT.visibility >= 2;
	if( $('#gallery-highlight-input').length !== 0)
		highlight = $('#gallery-highlight-input').prop('checked');

	updateGallery(caption, byline, tags, posts, highlight, function(err, GALLERY_EDIT){
		if (err)
			$.snackbar({content: resolveError(err)});
		else if (added.length > 0) {
			var data = new FormData();
			for (var index in added) {
				data.append(index, added[index]);
			}
			
			data.append('gallery', GALLERY_EDIT._id);
			$.ajax({
				url: '/scripts/gallery/addpost',
				type: 'POST',
				data: data,
				processData: false,
				contentType: false,
				cache: false,
				dataType: 'json',
				success: function(result, status, xhr){
					window.location.reload();
				},
				error: function(xhr, status, error){
					$.snackbar({content: resolveError(err)});
				}
			});
		}
		else 
			window.location.reload();
	});
}
//Save gallery edits
function galleryEditDelete(){
	alertify.confirm("Are you sure you want to delete this gallery?", function (e) {
		if (!e)
			return;
		
		$.ajax("/scripts/gallery/remove", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify({id:GALLERY_EDIT._id}),
			dataType: 'json',
			success: function(result){
				if(result.err){
					return this.error(null, null, result.err);
				};
	
				location.href = document.referrer || '/highlights';
			},
			error: function(xhr, status, error){
				$.snackbar({content:resolveError(error)});
			}
		});
	});
}

//Clear the edit fields
function galleryEditClear(){
	$('.gedit input').val('').trigger('keyup');
	$('.gedit textarea').val('').trigger('keyup');
	$('#gallery-highlight-input').prop('checked', false);
	$('#gallery-tags-list').empty();
	$('#gallery-stories-list').empty();
	$('#gallery-articles-list').empty();
	$('#gallery-location-input').empty().trigger('keyup');
}

var galleryEditInitialToggle = true;
var galleryEditMap = null;
var galleryEditPolygon = null;
var galleryEditAutocomplete = null;

//Update the edit fields
function galleryEditUpdate(){
	if(galleryEditInitialToggle){
		galleryEditInitialToggle = false;
		
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
		
		galleryEditMap = new google.maps.Map(document.getElementById('gallery-map-canvas'), mapOptions);
		
		var image = {
			url: "/images/assignment-active@2x.png",
			size: new google.maps.Size(114, 114),
			scaledSize: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(30, 30)
		};
		
		galleryEditPolygon = new google.maps.Polygon({
					paths: [],
					strokeColor: "#FFB500",
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: "#FFC600",
					fillOpacity: 0.35,
					map: galleryEditMap
				});
		
		galleryEditAutocomplete = new google.maps.places.Autocomplete(document.getElementById('gallery-location-input'));
		$('#gallery-location-input').attr('placeholder', '');
		google.maps.event.addListener(galleryEditAutocomplete, 'place_changed', function(){
			var place = galleryEditAutocomplete.getPlace();
			
			if(place.geometry){
				if(place.geometry.viewport){
					galleryEditMap.fitBounds(place.geometry.viewport);
				}
				else {
					galleryEditMap.panTo(place.geometry.location);
					galleryEditMap.setZoom(18);
				}
			}
		});
	}
	
	var firstLocation = null;

	for (var index in GALLERY_EDIT.posts){
		if (GALLERY_EDIT.posts[index].location.geo){
			firstLocation = GALLERY_EDIT.posts[index].location.geo.coordinates;
			break;
		}
	}
	
	if (GALLERY_EDIT.location){
		galleryEditPolygon.setMap(galleryEditMap);
		galleryEditPolygon.setPath(GALLERY_EDIT.location.coordinates[0].map(function(a){ return { lat: a[1], lng: a[0] }; }));
		galleryEditMap.fitBounds(galleryEditPolygon.getBounds());
	}else
		galleryEditPolygon.setMap(null);
	$('#gallery-location-input').val(GALLERY_EDIT.posts[0].location.address).trigger('keydown');
	
	$('#gallery-caption-input').val(GALLERY_EDIT.caption).trigger('keydown');
	$('#gallery-byline-input').val(GALLERY_EDIT.posts && GALLERY_EDIT.posts[0] ? GALLERY_EDIT.posts[0].byline : '').trigger('keydown');

	$('#gallery-highlight-input').prop('checked', GALLERY_EDIT.visibility >= 2);

	$('#gallery-tags-list').empty();
	GALLERY_EDIT.tags.forEach(function(tag){
		$('#gallery-tags-list').append(makeTag('#' + tag));
	});

	$('#gallery-stories-list').empty();
	if(GALLERY_EDIT.related_stories){
		GALLERY_EDIT.related_stories.forEach(function(story){
			var elem = makeTag(story.title);
			elem.data('id', story._id);
			$('#gallery-stories-list').append(elem);
		});
	}

	$('#gallery-articles-list').empty();
	GALLERY_EDIT.articles.forEach(function(article){
		var elem = makeTag(article.link);
		elem.data('id', article._id);
		$('#gallery-articles-list').append(elem);
	});

	$('.edit-gallery-images').empty();
	for (var index in GALLERY_EDIT.posts){
		if (GALLERY_EDIT.posts[index].video)
			$('.edit-gallery-images').append('\
				<video width="100%" height="100%" data-id="' + GALLERY_EDIT.posts[index]._id + '" controls>\
					<source src="' + GALLERY_EDIT.posts[index].video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4') + '" type="video/mp4">\
					Your browser does not support the video tag.\
				</video>\
			');
		else
			$('.edit-gallery-images').append('<img class="img-responsive" src="' + formatImg(GALLERY_EDIT.posts[index].image, 'medium') + '" data-id="' + GALLERY_EDIT.posts[index]._id + '"/>');
	}

	if (GALLERY_EDIT.files) {
		Object.keys(GALLERY_EDIT.files).forEach(function(index) {
			var file = GALLERY_EDIT.files[index];
			var reader = new FileReader()
			if (file.type.indexOf('video') !== -1) { //video
				var elem = $('\
					<video id="' + file.lastModified + '" data-id="NEW=' + index + '" width="100%" height="100%" controls>\
						<source type="video/mp4">\
						Your browser does not support the video tag.\
					</video>\
				');
				$('.edit-gallery-images').append(elem);
				reader.onload = function(e) {
					$('.edit-gallery-images').find('#' + file.lastModified).attr('src', e.target.result);
				}
			}
			else { //image
				var elem = $('<img class="img-responsive" id="' + file.lastModified + '" data-id="NEW=' + index + '"/>');
				$('.edit-gallery-images').append(elem);
				reader.onload = function(e) {
					$('.edit-gallery-images').find('#' + file.lastModified).attr('src', e.target.result);
				}
			}	
			reader.readAsDataURL(file);
		});
	}

	$('.edit-gallery-images').frick();
}

function galleryEditAddMore() {
	$('#gallery-upload-files').click();
}
function galleryEditFiles(e) {
	// var data = new FormData();
	var files = $('#gallery-upload-files').prop('files');
	
	GALLERY_EDIT.files = files;
	galleryEditUpdate();
}

//Clear the gallery create fields
function galleryCreateClear(){
	$('.gcreate input').val('').trigger('keyup');
	$('.gcreate textarea').val('').trigger('keyup');
	$('#gallery-create-highlight-input').prop('checked', false);
}

//Create the new gallery
function galleryCreateSave(){
	var caption = $('#gallery-create-caption-input').val();
	var tags = $('#gallery-create-tags-list .tag').text().split('#').filter(function(t){ return t.length > 0; });
	var articles = $('#gallery-create-articles-list li.chip').map(function(elem){return $(this).data('id')}).toArray();
	var stories = $('#gallery-create-stories-list li.chip').map(function(elem){return $(this).data('id')}).toArray();
	var posts = selectedPosts.map(function(post){ return post._id });

	var highlight = $('#gallery-create-highlight-input').prop('checked');

	createGallery(caption, tags, posts, highlight, articles, stories, function(err, gallery){
		if (err)
			$.snackbar({content: resolveError(err)});
		else
			window.location.assign("/gallery/" + gallery._id);
	});
}

function createGalleryView(gallery, half){
	var images = "";

	if (!gallery.posts || gallery.posts.length == 0){
		images = '<div class="flex-row"></div>';
	}else if (gallery.posts.length == 1){
		images = '<div class="flex-row">\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(gallery.posts[0].image, 'medium') + '">\
					</div>\
				</div>';
	}else if(gallery.posts.length < 5){
		images = '<div class="flex-row">\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(gallery.posts[0].image, 'medium') + '">\
					</div>\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(gallery.posts[1].image, 'medium') + '">\
					</div>\
				</div>';
	}else if(gallery.posts.length >= 5 && gallery.posts.length < 8){
		images = '<div class="flex-row">\
					<div class="flex-col">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[0].image, 'medium') + '" />\
						</div>\
					</div>\
					<div class="flex-col">\
						<div class="flex-row">\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(gallery.posts[1].image, 'small') + '" />\
							</div>\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(gallery.posts[2].image, 'small') + '" />\
							</div>\
						</div>\
						<div class="flex-row">\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(gallery.posts[3].image, 'small') + '" />\
							</div>\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(gallery.posts[4].image, 'small') + '">\
							</div>\
						</div>\
					</div>\
				</div>';
	}else if(gallery.posts.length >= 8){
		images = '<div class="flex-col">\
					<div class="flex-row">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[0].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[1].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[2].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[3].image, 'small') + '">\
						</div>\
					</div>\
					<div class="flex-row">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[4].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[5].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[6].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(gallery.posts[7].image, 'small') + '">\
						</div>\
					</div>\
				</div>';
	}

	var location = 'No Location';
	var size = half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';
	var stories = '';

	if (Array.isArray(gallery.related_stories)){
		for (var index in gallery.related_stories)
			stories += '<li><a href="/story/' + gallery.related_stories[index]._id + '">' + gallery.related_stories[index].title + '</a></li>';
	}
	
	for (var i in gallery.posts){
		if (gallery.posts[i].location.address){
			location = gallery.posts[i].location.address;
			break;
		}
	}

	var timestamp = gallery.time_created;
	var timeString = getTimeAgo(Date.now(), gallery.time_created);

	var elem = $('<div class="' + size + ' tile story">\
			<div class="tile-body">\
				<div class="frame"></div>\
				<div class="hover">\
					<p class="md-type-body1">' + (gallery.caption || '') + '</p>' +
					(stories ? '<ul class="md-type-body2">'+stories+'</ul>' : '') +
				'</div>\
				' + images + '\
			</div>\
			<div class="tile-foot">\
				<div class="hover">\
					<a href="/gallery/'+ gallery._id +'" class="md-type-body2">See all</a>\
					<!--<span class="mdi mdi-library-plus icon pull-right"></span>-->\
					<!--<span class="mdi mdi-download icon toggle-edit toggler pull-right"></span>-->\
				</div>\
				<div>\
					<div class="ellipses">\
						<span class="md-type-body2">' + location + '</span>\
						<span class="md-type-caption timestring" data-timestamp="' + timestamp + '">' + timeString +'</span>\
					</div>\
				</div>\
			</div>\
		</div>'
	);

	elem.find('.tile-body').click(function(){window.location.assign('/gallery/'+ gallery._id)}).css('cursor', 'pointer');

	elem.find('img.img-cover').each(function(){
		_this = $(this);
		attachOnImageLoadError(_this);
		_this.prop('src',_this.data('src'));
	});

	return elem;
}

function createStoryView(story, half){
	var images = "";

	if (!story.thumbnails || story.thumbnails.length == 0){
		images = '<div class="flex-row"></div>';
	}else if (story.thumbnails.length == 1){
		images = '<div class="flex-row">\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(story.thumbnails[0].image, 'medium') + '">\
					</div>\
				</div>';
	}else if(story.thumbnails.length < 5){
		images = '<div class="flex-row">\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(story.thumbnails[0].image, 'medium') + '">\
					</div>\
					<div class="img">\
						<img class="img-cover" data-src="' + formatImg(story.thumbnails[1].image, 'medium') + '">\
					</div>\
				</div>';
	}else if(story.thumbnails.length >= 5 && story.thumbnails.length < 8){
		images = '<div class="flex-row">\
					<div class="flex-col">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[0].image, 'medium') + '" />\
						</div>\
					</div>\
					<div class="flex-col">\
						<div class="flex-row">\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(story.thumbnails[1].image, 'small') + '" />\
							</div>\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(story.thumbnails[2].image, 'small') + '" />\
							</div>\
						</div>\
						<div class="flex-row">\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(story.thumbnails[3].image, 'small') + '" />\
							</div>\
							<div class="img">\
								<img class="img-cover" data-src="' + formatImg(story.thumbnails[4].image, 'small') + '">\
							</div>\
						</div>\
					</div>\
				</div>';
	}else if(story.thumbnails.length >= 8){
		images = '<div class="flex-col">\
					<div class="flex-row">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[0].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[1].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[2].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[3].image, 'small') + '">\
						</div>\
					</div>\
					<div class="flex-row">\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[4].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[5].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[6].image, 'small') + '">\
						</div>\
						<div class="img">\
							<img class="img-cover" data-src="' + formatImg(story.thumbnails[7].image, 'small') + '">\
						</div>\
					</div>\
				</div>';
	}

	var size = half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';

	var timestamp = story.time_created;
	var timeString = getTimeAgo(Date.now(), story.time_created);
	
	var elem = $('<div class="' + size + ' tile story">\
			<div class="tile-body">\
				<div class="frame"></div>\
				<div class="hover">\
					<p class="md-type-body1">' + (story.caption || '') + '</p>\
					<ul class="md-type-body2">\
						<li>' +  story.gallery_count +  (story.gallery_count == 1 ? ' gallery' : ' galleries') +'</li>\
					</ul>\
				</div>\
				' + images + '\
			</div>\
			<div class="tile-foot">\
				<div class="hover">\
					<a href="/story/'+ story._id +'" class="md-type-body2">See all</a>\
					<!--<span class="mdi mdi-library-plus icon pull-right"></span>-->\
					<!--<span class="mdi mdi-download icon toggle-edit toggler pull-right"></span>-->\
				</div>\
				<div>\
					<div>\
						<span class="md-type-body2">' + story.title + '</span>\
						<span class="md-type-caption timestring" data-timestamp="' + timestamp + '">' + timeString +'</span>\
					</div>\
				</div>\
			</div>\
		</div>');

		elem.find('img.img-cover').each(function(){
			_this = $(this);
			attachOnImageLoadError(_this);
			_this.prop('src',_this.data('src'));
		});

		return elem;
}
