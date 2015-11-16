var React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryEditBody = require('./gallery-edit-body.js');

/**
 * Gallery Edit Parent Object
 */

 var GalleryEdit = React.createClass({

 	displayName: 'Gallery Edit',

 	getDefaultProps: function(){
 		return {
 			gallery : {}
 		};
 	},

 	render: function(){

 		return (
 			<div>
	 			<div className="dim toggle-gedit">
	 				<input 
	 					id="gallery-upload-files" 
	 					type="file"  
	 					accept="image/*,video/*,video/mp4" 
	 					multiple />
	 			</div>
	 			<div className="edit panel panel-default toggle-gedit gedit">
	 				<div className="col-xs-12 col-lg-12 edit-new dialog">
	 					<GalleryEditHead />
	 					<GalleryEditFoot />
	 					<GalleryEditBody 
	 						gallery={this.props.gallery}
	 						user={this.props.user} />
	 				</div>
	 			</div>
 			</div>
 		);

 	}

 });

var GalleryEditHead = React.createClass({

	displayName: 'GalleryEditHead',

	render: function(){
		return (
			<div className="dialog-head">
				<span className="md-type-title">Edit Gallery</span>
				<span className="mdi mdi-close pull-right icon toggle-gedit toggler"></span>
			</div>
		);
	}


});

var GalleryEditFoot = React.createClass({

	displayName: 'GalleryEditFoot',

	render: function(){

		return (
			
			<div className="dialog-foot">
				<button id="gallery-revert-button" type="button" className="btn btn-flat">Revert changes</button>
				<button id="gallery-clear-button" type="button" className="btn btn-flat">Clear all</button>
				<button id="gallery-add-more-button" type="button" className="btn btn-flat">Add More</button>
				<button id="gallery-discard-button" type="button" className="btn btn-flat pull-right toggle-gedit toggler">Cancel</button>
				<button id="gallery-delete-button" type="button" className="btn btn-flat pull-right">Delete</button>
				<button id="gallery-save-button" type="button" onClick={this.save} className="btn btn-flat pull-right">Save</button>
			</div>

		);

	},
	//Save function 
	save: function(){

		var caption = $('#gallery-caption-input').val();
		var byline = $('.gallery-byline-text').eq(0).text();
		var other_origin = null;
		var tags = $('#gallery-tags-list .tag').text().split('#').filter(function(t){ return t.length > 0; });
		var posts = $('.edit-gallery-images').frick('frickPosts');
		var visibility = null;

		if ($('#gallery-other-origin').css('display') !== 'none') {
			byline = $('#gallery-name-input').val().trim() + ' / ' + $('#gallery-affiliation-input').val().trim();
			other_origin = {
				name: $('#gallery-name-input').val().trim(),
				affiliation: $('#gallery-affiliation-input').val().trim(),
			}
		}

		var added = posts.filter(function(id) {return id.indexOf('NEW') !== -1});
		added = added.map(function(index) {
			index = index.split('=')[1];
			return GALLERY_EDIT.files[index];
		});

		posts = posts.filter(function(id) {return id.indexOf('NEW') == -1});

		if (posts.length == 0)
			return $.snackbar({content:"Galleries must have at least 1 post"});

		if( $('#gallery-highlight-input').length !== 0 && galleryEditVisibilityChanged == 1)
			visibility = $('#gallery-highlight-input').prop('checked') ? 2 : 1;

		updateGallery(caption, byline, tags, posts, visibility, other_origin, function(err, GALLERY_EDIT){
			
			if (err)
				return $.snackbar({content: resolveError(err)});

			if (added.length > 0) {
				
				var data = new FormData();
				
				for (var index in added) {
					data.append(index, added[index]);
				}

				data.append('gallery', GALLERY_EDIT._id);
				
				$.ajax({
					url: '/scripts/gallery/addpost',
					type: 'POST',
					data: data,
					processData: false,
					contentType: false,
					cache: false,
					dataType: 'json',
					success: function(result, status, xhr){
						window.location.reload();
					},
					error: function(xhr, status, error){
						$.snackbar({content: resolveError(err)});
					}
				});

			}
			else
				window.location.reload();
		});


	}

});




module.exports = GalleryEdit;