var PAGE_Story = {
	offset: 0,
	postList: $('.story-post-list'),
	followerCount: $('.story-followers'),
	galleryCount: $('.story-galleries'),
	photoCount: $('.story-photos'),
	videoCount: $('.story-videos'),
	
	

	loadPosts: function(){
		$.ajax({
			url: API_URL + "/v1/story/posts?limit=15&offset="+PAGE_Story.offset+"&id="+PAGE_Story.story._id,
			type: 'GET',
			success: function(result, status, xhr){
				if (result.err)
					return this.error(null, null, result.err);

				result.data.forEach(function(post){
					var elem = buildPost(post, purchases ? purchases.indexOf(post._id) != -1 : null, 'large', post.license != "Twitter");
					PAGE_Story.postList.append(elem);
					++PAGE_Story.offset;
				});
				
				setTimeDisplayType(PAGE_Story.display);
			},
			error: function(xhr, status, error){
				$.snackbar({content: 'Error loading story content: ' + resolveError(error)});
			}
		});
	},

	loadStory: function(){
		$.ajax({
			url: API_URL + "/v1/story/get",
			type: 'GET',
			data: { id: PAGE_Story.story._id },
			dataType: 'json',
			success: function(result, status, xhr){
				PAGE_Story.story = result.data;
				
				document.getElementById('story-description').innerHTML = PAGE_Story.story.caption ? PAGE_Story.story.caption : "No Description";
				document.getElementById('story-title').innerHTML = PAGE_Story.story.title ? PAGE_Story.story.title : "Empty Title";

				if (PAGE_Story.story.stats){
					//PAGE_Story.followerCount.after(PAGE_Story.story.stats.followers + ' ' + (PAGE_Story.story.stats.followers == 1 ? 'follower' : 'followers')).css('display', 'inline-block');
					PAGE_Story.galleryCount.after(PAGE_Story.story.stats.galleries + ' ' + (PAGE_Story.story.stats.galleries == 1 ? 'gallery' : 'galleries')).css('display', 'inline-block');
					PAGE_Story.photoCount.after(PAGE_Story.story.stats.photos + ' ' + (PAGE_Story.story.stats.photos == 1 ? 'photo' : 'photos')).css('display', 'inline-block');
					PAGE_Story.videoCount.after(PAGE_Story.story.stats.videos + ' ' + (PAGE_Story.story.stats.videos == 1 ? 'video' : 'videos')).css('display', 'inline-block');
				}else{
					//PAGE_Story.followerCount.css('display', 'none');
					PAGE_Story.galleryCount.css('display', 'none');
					PAGE_Story.photoCount.css('display', 'none');
					PAGE_Story.videoCount.css('display', 'none');
				}
	
				PAGE_Story.loadPosts();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},

	storyEditUpdate: function(){
		if (PAGE_Story.story.caption)
			$('#story-edit-caption').css('display', 'inline-block').text(PAGE_Story.story.caption);
		else
			$('#story-edit-caption').css('display', 'none');
		$('#story-edit-date').text(timestampToDate(PAGE_Story.story.time_created));
		$('#story-edit-photo-num').text(PAGE_Story.story.stats.photos + (PAGE_Story.story.stats.photos === 1 ? ' photo' : ' photos'));
		$('#story-edit-video-num').text(PAGE_Story.story.stats.videos + (PAGE_Story.story.stats.photos === 1 ? ' video' : ' videos'));
		//$('#story-edit-caption').text(PAGE_Story.story.caption || '');
		$('#story-edit-title-input').val(PAGE_Story.story.title).trigger('keyup');
		$('#story-edit-caption-input').val(PAGE_Story.story.caption).trigger('keyup');

		$('#story-edit-tags').empty();
		if(PAGE_Story.story.tags){
			PAGE_Story.story.tags.forEach(function(tag){
				$('#story-edit-tags').append(makeTag('#' + tag));
			});
		}
	},

	storyEditClear: function(){
		$('#story-edit-title-input').val('').trigger('keyup');
		$('#story-edit-caption-input').val('').trigger('keyup');
		$('#story-edit-tag-input').val('').trigger('keyup');
		$('#story-edit-tags').empty();
	},
	
	storyEditSave: function(){
		var params = {
			id: PAGE_Story.story._id,
			title: $('#story-edit-title-input').val(),
			caption: $('#story-edit-caption-input').val(),
			tags: $('#story-edit-tags .tag').text().split('#').filter(function(t){ return t.length > 0; })
		}
		$.ajax("/scripts/story/update", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: function(result){
				if(result.err)
					return this.error(null, null, result.err);
					
				window.location.reload();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},
	
	follow: function(){
		var params = {
			other: PAGE_Story.story._id,
			type: 'stories'
		};
		$.ajax("/scripts/user/follow", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: function(result){
				if(result.err){
					return this.error(null, null, result.err);
				};
				window.location.reload();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},
	
	unfollow: function(){
		var params = {
			other: PAGE_Story.story._id,
			type: 'stories'
		};
		$.ajax("/scripts/user/unfollow", {
			method: 'post',
			contentType: "application/json",
			data: JSON.stringify(params),
			success: function(result){
				if(result.err)
					return this.error(null, null, result.err);
				
				window.location.reload();
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});
	},
};

$(document).ready(function(){
	PAGE_Story.loadStory();
	
	$('#story-edit-revert').click(PAGE_Story.storyEditUpdate);
	$('#story-edit-clear').click(PAGE_Story.storyEditClear);
	$('#story-edit-discard').click(PAGE_Story.storyEditClear);
	$('#story-edit-save').click(PAGE_Story.storyEditSave);
	$('.toggle-sedit.toggler').click(PAGE_Story.storyEditUpdate);

	$('#story-edit-tag-input').on('keydown', function(ev){
		if(ev.keyCode != 13) return;
		if ($(this).val() === '') return;
		$('#story-edit-tags').append(makeTag('#' + $(this).val()));
		$(this).val('').trigger('keyup');
	});
	
	$('#story-follow').click(function(){
		if(following.stories.indexOf(PAGE_Story.story._id) == -1)
			PAGE_Story.follow();
		else
			PAGE_Story.unfollow();
	});

	$('.time-display-filter-type').click(function(){
		$('.time-display-filter-text').text($(this).text());
		if($(this).data('filter-type') == 'relative'){
			PAGE_Story.display = 'relative';
		}
		else if ($(this).data('filter-type') == 'absolute'){
			PAGE_Story.display = 'absolute';
		}
		setTimeDisplayType(PAGE_Story.display);
		$('.time-display-filter-button').click();
		
		$('.time-display-filter-type').removeClass('active');
		$(this).addClass('active');
	});

	$('.grid').scroll(function() {
		if(!PAGE_Story.loading && $('.grid')[0].scrollHeight - $('.grid').scrollTop() <= $('.grid').height() + 64)
			PAGE_Story.loadPosts();
	});
});