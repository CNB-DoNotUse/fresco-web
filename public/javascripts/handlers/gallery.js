var PAGE_Gallery = {
	postsElm: $('#posts'),
	sort_key: 'time_created',
	
	loadPostsForGallery: function(){
		var posts = PAGE_Gallery.gallery.posts;
		
		posts.sort(function(a, b) {
			if (a[PAGE_Gallery.sort_key] > b[PAGE_Gallery.sort_key]) return 1;
			if (a[PAGE_Gallery.sort_key] < b[PAGE_Gallery.sort_key]) return -1;
			return 0;
		});
		posts.reverse();
		
		posts.forEach(function(post){
			var postView = $(buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', false));
			PAGE_Gallery.postsElm.append(postView);
		});
		
		setTimeDisplayType(PAGE_Gallery.display);
	}
};

$(document).ready(function(){
	$('.time-filter-type').click(function(){
		$('.time-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'capture' && PAGE_Assignment.sort_key !== 'time_captured'){
			PAGE_Assignment.sort_key = 'time_captured';
			PAGE_Assignment.refreshList();
		}
		else if ($(this).data('filter-type') == 'upload' && PAGE_Assignment.sort_key !== 'time_created'){
			PAGE_Assignment.sort_key = 'time_created';
			PAGE_Assignment.refreshList();
		}
		$('.time-filter-button').click();
		
		$('.time-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
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
		
		$('.time-display-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	PAGE_Gallery.loadPostsForGallery();
});