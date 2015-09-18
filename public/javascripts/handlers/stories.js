var PAGE_Stories = {
	offset: 0,
	loading: false,
	verified: true,



	refreshList: function(){
		$('.container-fluid.grid').scrollTop(0);
		PAGE_Stories.offset = 0;
		$('#stories').empty();
		PAGE_Stories.loadStories();
		var tags = [];
		$('#tag-filter').find('.tag').each(function(i, elem){
			tags.push($(elem).text().substr(1));
		});
		$('#tag-dropdown').text(tags.length > 0 ? 'Tags: ' + tags.join(', ') : 'Any tags');
	},

	loadStories: function(){
		if (PAGE_Stories.loading) return;
		var tags = [];
		$('#tag-filter').find('.tag').each(function(i, elem){
			tags.push($(elem).text().substr(1));
		});
		
		$.ajax({
			url: API_URL + '/v1/story/recent',
			type: 'GET',
			data: {
				limit: 20,
				offset: PAGE_Stories.offset,
				tags: tags.join(','),
				invalidate: 1
			},
			success: function(result, status, xhr){
				if (result.err) return this.error(null, null, result.err);		
				result.data.forEach(function(gallery){
					var elem = createStoryView(gallery, true);
					$('#stories').append(elem);
					PAGE_Stories.offset += 1;
				});
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	}
};

$(document).ready(function(){
	PAGE_Stories.refreshList();
	
	$('#tag-filter-input').change(function(){
		var elem = makeTag('#' + $(this).val());
		$('#tag-filter').append(elem);
		$(this).val('');
		PAGE_Stories.refreshList();
		elem.click(function(){
			PAGE_Stories.refreshList();
		});
	});
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Stories.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Stories.loadStories();
	});
});