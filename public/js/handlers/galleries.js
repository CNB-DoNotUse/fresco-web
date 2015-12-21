var PAGE_Galleries = {
	offset: 0,
	loading: false,
	verified: true,
	display: 'relative',

	refreshList: function(){
		$('.container-fluid.grid').scrollTop(0);
		PAGE_Galleries.offset = 0;
		$('#galleries').empty();
		PAGE_Galleries.loadGalleries();
		var tags = [];
		$('#tag-filter').find('.tag').each(function(i, elem){
			tags.push($(elem).text().substr(1));
		});
		$('#tag-dropdown').text(tags.length > 0 ? 'Tags: ' + tags.join(', ') : 'Any tags');
	},
	
	loadGalleries: function(){
		if (PAGE_Galleries.loading) return;
		var tags = [];
		$('#tag-filter').find('.tag').each(function(i, elem){
			tags.push($(elem).text().substr(1));
		})
		
		$.ajax({
			url: '/scripts/gallery/list',
			type: 'GET',
			data: {
				limit: 20,
				offset: PAGE_Galleries.offset,
				verified: PAGE_Galleries.verified ? 'true' : 'false',
				tags: tags.join(',')
			},
			success: function(result, status, xhr){
				if (result.err) return this.error(null, null, result.err);		
				result.data.forEach(function(gallery){
					var elem = createGalleryView(gallery, true);
					$('#galleries').append(elem);
					PAGE_Galleries.offset += 1;
				});
				
				setTimeDisplayType(PAGE_Galleries.display);
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	}
};

$(document).ready(function(){
	PAGE_Galleries.refreshList();
	
	$('.filter-type').click(function(){
		$('.filter-text').text($(this).text());
		if($(this).text() == 'Verified content' && !PAGE_Galleries.verified){
			PAGE_Galleries.verified = true;
			PAGE_Galleries.refreshList();
		}
		else if ($(this).text() == 'All content' && PAGE_Galleries.verified){
			PAGE_Galleries.verified = false;
			PAGE_Galleries.refreshList();
		}
		$('.filter-button').click();
		
		$('.filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('#tag-filter-input').change(function(){
		var elem = makeTag('#' + $(this).val());
		$('#tag-filter').append(elem);
		$(this).val('');
		PAGE_Galleries.refreshList();
		elem.click(function(){
			PAGE_Galleries.refreshList();
		});
	});
	
	$('.time-display-filter-type').click(function(){
		$('.time-display-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'relative'){
			PAGE_Galleries.display = 'relative';
		}
		else if ($(this).data('filter-type') == 'absolute'){
			PAGE_Galleries.display = 'absolute';
		}
		setTimeDisplayType(PAGE_Galleries.display);
		$('.time-display-filter-button').click();
		
		$('.time-display-filter-type').removeClass('active');
		$(this).addClass('active');
	});
	
	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_Galleries.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_Galleries.loadGalleries();
	});
});