var PAGE_Gallery = {
	postsElm: $('#posts'),
	
	loadPostsForGallery: function(){
		var posts = PAGE_Gallery.gallery.posts;
		
		posts.forEach(function(post){
			var postView = $(buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', false));
			PAGE_Gallery.postsElm.append(postView);
		});
	}
};

$(document).ready(function(){
	PAGE_Gallery.loadPostsForGallery();
});