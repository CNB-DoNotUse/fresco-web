var PAGE_Content = {
	offset: 0,
	loading: false,
	verified: true,
	sort: 'capture',
	display: 'relative',
	
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
		
		params.sort = PAGE_Content.sort;
		
		$.ajax({
			url: '/scripts/post/list',
			type: 'GET',
			data: params,
			success: function(result, status, xhr){
				if (result.err) return this.error(null, null, result.err);
				
				result.data.forEach(function(post){
					var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'small', true, PAGE_Content.sort, PAGE_Content.display);
					$('.content-tiles').append(elem);
					PAGE_Content.offset += 1;
				});
				
				setTimeDisplayType(PAGE_Content.display);
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
	
	$('.content-filter-type').click(function(){
		$('.content-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'verified' && !PAGE_Content.verified){
			PAGE_Content.verified = true;
			PAGE_Content.refreshList();
		}
		else if ($(this).data('filter-type') == 'all' && PAGE_Content.verified){
			PAGE_Content.verified = false;
			PAGE_Content.refreshList();
		}
		$('.content-filter-button').click();
		
		$('.content-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.time-filter-type').click(function(){
		$('.time-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'capture' && PAGE_Content.sort !== 'capture'){
			PAGE_Content.sort = 'capture';
			PAGE_Content.refreshList();
		}
		else if ($(this).data('filter-type') == 'upload' && PAGE_Content.sort !== 'upload'){
			PAGE_Content.sort = 'upload';
			PAGE_Content.refreshList();
		}
		$('.time-filter-button').click();
		
		$('.time-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.time-display-filter-type').click(function(){
		$('.time-display-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'relative'){
			PAGE_Content.display = 'relative';
		}
		else if ($(this).data('filter-type') == 'absolute'){
			PAGE_Content.display = 'absolute';
		}
		setTimeDisplayType(PAGE_Content.display);
		$('.time-display-filter-button').click();
		
		$('.time-display-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Content.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Content.loadPosts();
	});
});
