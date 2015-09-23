var PAGE_Search = {
	query: '',
	purchases: [],
	makeStoryListItem: function(story) {
		var elemText = '<li><a href="/story/' + story._id + '">' + story.title + '</a></li>';
		return $(elemText);
	},
	refreshStories: function(callback) {
		$.ajax({
			url: '/scripts/story/search',
			type: 'GET',
			data: {q: PAGE_Search.query},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(story){
					var elem = PAGE_Search.makeStoryListItem(story);
					$('#stories').append(elem);
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
			}
		});
	},
	refreshPosts: function(callback) {
		$.ajax({
			url: '/scripts/gallery/search',
			type: 'GET',
			data: {q: PAGE_Search.query},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(gallery){
					gallery.posts.forEach(function(post){
						var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', true);
						$('#posts').append(elem);
					});
				});
				console.log(result);
			},
			error: function(xhr, status, error ){
				callback(error, null);
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
});