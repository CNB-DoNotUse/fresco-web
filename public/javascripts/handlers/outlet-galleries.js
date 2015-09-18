var PAGE_OutletGalleries = {
	offset: 0,
	loading: false,



	loadGalleries: function(){
		if(!PAGE_OutletGalleries.loading){
			PAGE_OutletGalleries.loading = true;

			$.ajax({
				url: API_URL + "/v1/outlet/galleries",
				type: 'GET',
				data: {
					id : PAGE_OutletGalleries.outlet._id,
					limit: 14,
					offset: PAGE_OutletGalleries.offset
				},
				dataType: 'json',
				success: function(result, status, xhr){
					if (result.err)
						return this.error(null, null, result.err);

					var galleries = result.data;

					galleries.forEach(function(gallery){
						var elem = createGalleryView(gallery);
						elem.find('.mdi-download').click(function(){
							window.open('/gallery/download/' + gallery._id);
						});

						$('.tiles').append(elem);

						++PAGE_OutletGalleries.offset;
					});
				},
				error: function(xhr, status, error){
					$.snackbar({content: resolveError(error)});
				},
				complete: function(){
					PAGE_OutletGalleries.loading = false;
				}
			});
		}
	}
};

$(document).ready(function(){
	PAGE_OutletGalleries.loadGalleries();

	$('.container-fluid.grid').scroll(function() {
		if(!PAGE_OutletGalleries.loading && $('.container-fluid.grid')[0].scrollHeight - $('.container-fluid.grid').scrollTop() <= $('.container-fluid.grid').height() + 64)
			PAGE_OutletGalleries.loadGalleries();
	});
});
