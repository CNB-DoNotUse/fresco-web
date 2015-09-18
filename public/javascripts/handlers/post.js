var PAGE_Post = {
	
};

$(document).ready(function(){
	if (PAGE_Post.post.license == "Twitter") {
		$('.mdi-download').on('click', function(){
			if(PAGE_Post.post.video){
				window.open(PAGE_Post.post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4'));
			}
			else{
				window.open(PAGE_Post.post.image);
			}
		});
	}else{
		$('.mdi-download').on('click', function(){
			var link = document.createElement("a");
		    link.href = PAGE_Post.post.video ? PAGE_Post.post.video.replace('/videos', '/videos/mp4').replace('.m3u8', '.mp4') : PAGE_Post.post.image;
		    link.download = 'Fresco-News-' + PAGE_Post.post._id + '.' + (PAGE_Post.post.video ? '.mp4' : link.href.split('.').pop());
		    link.click();
		});
	}
	
	$('#post-edit-button').click(function(){
		$.ajax({
			url: '/scripts/post/gallery',
			type: 'GET',
			data: {id: PAGE_Post.post._id},
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);
					
				GALLERY_EDIT = result.data;
				galleryEditUpdate();
				$(".toggle-gedit").toggleClass("toggled");
			},
			error: function(xhr, status, error){
				$.snackbar({content:resolveError(error)});
			}
		})
	});
	
	$('.mdi-cash').click(function(e){
		if (!PAGE_Post.post)
			return $.snackbar({content:'Invalid post'});
		
		alertify.confirm("Are you sure you want to purchase? This will charge your account.", function (e) {
		    if (e) {
				$.ajax({
					url: '/scripts/outlet/checkout',
					method: 'post',
					contentType: "application/json",
					data: JSON.stringify({
						posts: [PAGE_Post.post._id],
						assignment: getUrlVars().assignment
					}),
					success: function(result, status, xhr){
						if (result.err)
							return this.error(null, null, result.err);
							
						window.location.reload();
					},
					error: function(xhr, status, error){
						$.snackbar({content:resolveError(error)});
					}
				});
		    } else {
		        // user clicked "cancel"
		    }
		});
	});
});