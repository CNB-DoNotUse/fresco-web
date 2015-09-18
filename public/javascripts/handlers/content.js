var PAGE_Content = {
	offset: 0,
	loading: false,
	verified: true,
	
	refreshList: function(){
		PAGE_Content.offset = 0;
		$('.content-tiles').empty();
		PAGE_Content.loadPosts();
	},
	loadPosts: function(){
		if (PAGE_Content.loading) return;
		PAGE_Content.loading = true;
		
		var params = {
				limit: 30,
				offset: PAGE_Content.offset
			}
		console.log(window.location.pathname);
		if (window.location.pathname == '/content/images')
			params.type = 'image';
		if (window.location.pathname == '/content/videos')
			params.type = 'video';
		
		params.verified = PAGE_Content.verified;
		
		$.ajax({
			url: '/scripts/post/list',
			type: 'GET',
			data: params,
			success: function(result, status, xhr){
				if (result.err) return this.error(null, null, result.err);
				
				result.data.forEach(function(post){
					var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'small', true);
					$('.content-tiles').append(elem);
					PAGE_Content.offset += 1;
				});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			},
			complete: function(){
				PAGE_Content.loading = false;
			}
		});
	}
};

$(document).ready(function(){
	PAGE_Content.refreshList();
	
	$('.filter-type').click(function(){
		$('.filter-text').text($(this).text());
		if($(this).text() == 'Verified content' && !PAGE_Content.verified){
			PAGE_Content.verified = true;
			PAGE_Content.refreshList();
		}
		else if ($(this).text() == 'All content' && PAGE_Content.verified){
			PAGE_Content.verified = false;
			PAGE_Content.refreshList();
		}
		$('.filter-button').click();
	});
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Content.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Content.loadPosts();
	});
});
