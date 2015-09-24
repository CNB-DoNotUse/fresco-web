var PAGE_Search = {
	query: '',
	purchases: [],
	makeStoryListItem: function(story) {
		var elemText = '<li><a href="/story/' + story._id + '">' + story.title + '</a></li>';
		return $(elemText);
	},
	makeAssignmentListItem: function(assignment) {
		var elemText = '<li><a href="/assignment/' + assignment._id + '">' + assignment.title + '</a></li>';
		return $(elemText);
	},
	makeUserListItem: function(user) {
		var image = user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png';
		var twitter = user.twitter ? '<a href="http://www.twitter.com/' + user.twitter + '">@' + user.twitter : 'No Twitter';
		var outlet = user.outlet ? '<a href="/outlet/' + user.outlet._id + '">' + user.outlet.title + '</a>' : 'No Outlet';
		var elemText =  '<li class="meta-user">' +
		'	<div>' +
		'		<a href="/user/' + user._id + '"><img class="img-circle img-responsive" src="' + image + '"></a>' +
		'	</div>' +
		'	<div>' +
		'		<a href="/user/' + user._id + '"><span class="md-type-title">' + user.firstname + ' ' + user.lastname + '</span></a>' +
		'		<span class="md-type-body1">' + twitter + ' &bull; ' + outlet + '</span>' +
		'	</div>' +
		'</li>';
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
	assignment_offset: 0,
	assignment_loading: false,
	refreshAssignments: function(callback) {
		if (PAGE_Search.assignment_loading) return;
		PAGE_Search.assignment_loading = true;
		
		$.ajax({
			url: '/scripts/assignment/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.assignment_offset,
				limit: 10
			},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(assignment){
					var elem = PAGE_Search.makeAssignmentListItem(assignment);
					$('#assignments').append(elem);
					PAGE_Search.assignment_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
			},
			complete: function(){
				PAGE_Search.assignment_loading = false;
			}
		});
	},
	user_offset: 0,
	user_loading: false,
	refreshUsers: function(callback) {
		if (PAGE_Search.user_loading) return;
		PAGE_Search.user_loading = true;
		
		$.ajax({
			url: '/scripts/user/search',
			type: 'GET',
			data: {
				q: PAGE_Search.query,
				offset: PAGE_Search.user_offset,
				limit: 10
			},
			success: function(result) {
				if (Object.keys(result.err).length > 0) {
					$.snackbar({content: resolveError(result.err)});
					return callback(result.err, null);
				}
				result.data.forEach(function(user){
					var elem = PAGE_Search.makeUserListItem(user);
					$('#users').append(elem);
					PAGE_Search.user_offset += 1;
				});
			},
			error: function(xhr, status, error ){
				callback(error, null);
			},
			complete: function(){
				PAGE_Search.user_loading = false;
			}
		});
	},
	refresh: function(){
		PAGE_Search.refreshStories();
		PAGE_Search.refreshPosts();
		PAGE_Search.refreshAssignments();
		PAGE_Search.refreshUsers();
	}
};

$(document).ready(function() {
	PAGE_Search.refresh();
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Search.post_loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Search.refreshPosts();
	});
});