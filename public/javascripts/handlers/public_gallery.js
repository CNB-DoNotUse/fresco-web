var PAGE_Public_Gallery = {
	
	getGallery: function(callback) {
		$.ajax({
			url: API_URL + '/v1/gallery/get',
			type: 'GET',
			data: {
				id: PAGE_Public_Gallery.gallery_id,
				stories: true,
				stats: 1
			},
			dataTYpe: 'json',
			success: function(result, status, xhr) {
				return callback(null, result.data);
			},
			error: function(chr, status, error) {
				$.snackbar({content: resolveError(error)});
				callback(error);
			}
		});
	},
	
	loadGalleries: function(galleries, callback){
		$.ajax({
			url: API_URL + "/v1/gallery/resolve/",
			type: 'GET',
			data: { galleries: galleries, stories : true },
			dataType: 'json',
			success: function(result, status, xhr){	
				return callback(null, result.data);
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				callback(error);
			}
		});
	},

	loadStory: function(story_id, callback){
		$.ajax({
			url: API_URL + "/v1/story/get",
			type: 'GET',
			data: { id: story_id },
			dataType: 'json',
			success: function(result, status, xhr){
				callback(null, result.data);
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				callback(error);
			}
		});
	},
	
	getRelated: function(gallery, callback){
		$.ajax({
			url: '/scripts/gallery/list',
			type: 'GET',
			data: {
				limit: 10,
				offset: 0,
				verified: 'true',
				tags: gallery.tags.join(',')
			},
			success: function(result, status, xhr){
				callback(null, result.data);
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
				callback(error);
			}
		});
	}
};

$(document).ready(function() {
	
	$("img.lazy").lazyload({
	 	threshold : 240
	});

	// slick
	$(".slick").slick({
		lazyLoad: 'ondemand',
		dots : true,
		adaptiveHeight : true,
		autoplay : false
	});
	
	$(".slide.hide").toggleClass('hide');
	
	$(".slick-prev").html("&lsaquo;");
	$(".slick-next").html("&rsaquo;");
	
	PAGE_Public_Gallery.gallery.related_stories = PAGE_Public_Gallery.gallery.related_stories.slice(0, 2);
	
	PAGE_Public_Gallery.gallery.related_stories.forEach(function(story){
		var elem = $('<div class="story" id="' + story._id + '"><h2 class="section">More From ' + story.title + '</h2></div>');
		$('#more-galleries').append(elem);
		PAGE_Public_Gallery.loadStory(story._id, function(err, story){
			if(err) {
				console.log(err);
				return;
			}
			story.galleries = story.galleries.slice(0, 10);
			PAGE_Public_Gallery.loadGalleries(story.galleries, function(err, galleries){
				if(err) {
					console.log(err);
					return;
				}
				//We don't want to show the same gallery the user is currently looking at
				galleries = galleries.filter(function(gallery){ return gallery._id != PAGE_Public_Gallery.gallery._id});
				if(galleries.length > 0 ){
					var post_count = 0;
					galleries.forEach(function(gallery){
						var gallery_elem = $('<a class="gallery" href="/gallery/' + gallery._id + '"></a>');
						gallery.posts.forEach(function(post){
							if(post_count >= 10) return;
							var postElem = $('<img class="post lazy" src="' + formatImg(post.image, 'small') + '"></img>');
							gallery_elem.append(postElem);
							post_count++;
						});
						elem.append(gallery_elem);
					});
				}
				else {
					elem.remove();
				}
			});
		});
	});
	
	var related_elem = $('<div class="story"><h2 class="section">Related Galleries</h2></div>');
	$('#more-galleries').append(related_elem);

	PAGE_Public_Gallery.getRelated(PAGE_Public_Gallery.gallery, function(err, related){
		related = related.filter(function(gallery){ return gallery._id != PAGE_Public_Gallery.gallery._id});
		var post_count = 0;
		if(related.length > 0 ){
			related.forEach(function(gallery){
				var gallery_elem = $('<a class="gallery" href="/gallery/' + gallery._id + '"></a>');
				gallery.posts.forEach(function(post){
					if(post_count >= 10) return;
					var postElem = $('<img class="post lazy" src="' + formatImg(post.image, 'small') + '"></img>');
					gallery_elem.append(postElem);
					post_count++;
				});
				related_elem.append(gallery_elem);
			});
		}
		else {
			related_elem.remove();
		}
	});
	
	if (PAGE_Public_Gallery.gallery.articles.length > 0){
		var articles_elem = $('<div class="story"><h2 class="section">Articles</h2><div class="meta-list"><ul class="md-type-subhead"></ul></div</div>');
		$('#more-galleries').append(articles_elem);
		PAGE_Public_Gallery.gallery.articles.forEach(function(article){
			var article_elem = $('<li><span><img class="favicon" src="' + article.favicon + '"></span><a href="' + article.link + '">' + article.title + '</a></li>');
			articles_elem.find('.md-type-subhead').append(article_elem);
		});
	}

	

});