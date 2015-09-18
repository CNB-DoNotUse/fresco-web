var PAGE_Highlights = {
	offset: 0,
	loading: false,
	
	loadGalleries: function(){
		if(!PAGE_Highlights.loading){
			PAGE_Highlights.loading = true;
			
			$.ajax({
				url: API_URL + "/v1/gallery/highlights",
				type: 'GET',
				data: {
					limit: 14,
					offset: PAGE_Highlights.offset,
					invalidate: 1
				},
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);
						
					var galleries = result.data;
					
					galleries.forEach(function(gallery){
						var elem = $(createGalleryView(gallery));
						
						elem.find('.mdi-download').click(function(){
							window.open('/scripts/gallery/download/' + gallery._id);
						});
						
						$('.tiles').append(elem);
	
						++PAGE_Highlights.offset;
					});
	
					PAGE_Highlights.loading = false;
				},
				error: function(xhr, status, error){
					$.snackbar({content: resolveError(error)});
				},
				complete: function(){
					PAGE_Highlights.loading = false;
				}
			});
		}
	},

	loadStories: function(){
		var list = $('.trending-stories');
		
		list.empty();
				
		$.ajax({
			url: API_URL + "/v1/story/recent",
			type: 'GET',
			data: {
				limit: 3
			},
			dataType: 'json',
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
					
				result = result.data;
				
				for (var index in result){
					list.append(
						'<li><a href="/story/' + result[index]._id + '">' + result[index].title + '</a></li>'
					);
				}
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});	
	}
};

$(document).ready(function(){
	//Load initial galleries
	PAGE_Highlights.loadGalleries();
	//Load trending stories
	PAGE_Highlights.loadStories();

	//Load when scrolled to bottom
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Highlights.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Highlights.loadGalleries();
	});
});