var PAGE_User = {
	postsElm: $('#posts'),
	offset: 0,
	loading: false,
	
	
	
	loadPosts: function(){
		if (PAGE_User.loading) return;
		PAGE_User.loading = true;
		
		$.ajax({
			url: API_URL + "/v1/user/posts",
			type: 'GET',
			data: {
				id: PAGE_User.user._id,
				limit: 15,
				offset: PAGE_User.offset
			},
			dataType: 'json',
			success: function(result, status, xhr){
				var posts = result.data;
				
				for (var index in posts)
					PAGE_User.postsElm.append(buildPost(posts[index], PAGE_User.purchases.indexOf(posts[index]._id) >= 0, 'large'));
			
				PAGE_User.offset += posts.length;
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			},
			complete: function(){
				PAGE_User.loading = false;
			}
		});
	}
};

$(document).ready(function(){
	PAGE_User.loadPosts();
	
	$('.mdi-pencil').on('click', function(evt){
		window.location.assign('/user/settings');
	});
	$('.grid').scroll(function() {
		if(!PAGE_User.loading && $(this)[0].scrollHeight - $(this).scrollTop() <= $(this).height() + 64)
			PAGE_User.loadPosts();
	});
});