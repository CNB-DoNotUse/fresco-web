var PAGE_Search = {
	query: '',
	purchases: [],
	makeStoryListItem: function(story) {
		var elemText = '<li><a href="/story/' + story._id + '">' + story.title + '</a></li>';
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
				limit: 10
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
				limit: 12
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
	refresh: function(){
		PAGE_Search.refreshStories();
		PAGE_Search.refreshPosts();
	}
};

$(document).ready(function() {
	PAGE_Search.refresh();
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Search.post_loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Search.refreshPosts();
	});
});