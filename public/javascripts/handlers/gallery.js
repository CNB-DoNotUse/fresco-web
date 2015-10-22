var PAGE_Gallery = {
	postsElm: $('#posts'),
	
	loadPostsForGallery: function(){
		var posts = PAGE_Gallery.gallery.posts;
		
		posts.forEach(function(post){
			var postView = $(buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', false));
			PAGE_Gallery.postsElm.append(postView);
		});
		
		setTimeDisplayType(PAGE_Gallery.display);
	}
};

$(document).ready(function(){
	
	$('.time-display-filter-type').click(function(){
		$('.time-display-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'relative'){
			PAGE_Gallery.display = 'relative';
		}
		else if ($(this).data('filter-type') == 'absolute'){
			PAGE_Gallery.display = 'absolute';
		}
		setTimeDisplayType(PAGE_Gallery.display);
		$('.time-display-filter-button').click();
	});
	
	PAGE_Gallery.loadPostsForGallery();
});