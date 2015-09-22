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
		})
	},
	refresh: function(){
		PAGE_Search.refreshStories();
	}
};

$(document).ready(function() {
	PAGE_Search.refresh();
});