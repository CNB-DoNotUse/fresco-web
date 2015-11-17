var React = require('react'),
	ReactDOM = require('react-dom');

var GalleryEditFoot = React.createClass({

	displayName: 'GalleryEditFoot',

	getInitialState: function(){
		return{
			gallery: this.props.gallery
		}
	},

	render: function(){

		var addMore = '';

		if(this.state.gallery.imported) 
			addMore = <button id="gallery-add-more-button" type="button" onClick={this.addMore} className="btn btn-flat">Add More</button>

		return (
			
			<div className="dialog-foot">
				
				<input 
					id="gallery-upload-files" 
					type="file"  
					accept="image/*,video/*,video/mp4" 
					multiple
					style={style} 
					ref='fileUpload'
					onChange={this.fileUploaderChanged} />

				<button id="gallery-revert-button" type="button" onClick={this.revert} className="btn btn-flat">Revert changes</button>
				<button id="gallery-clear-button" type="button" onClick={this.clear} className="btn btn-flat">Clear all</button>
				{addMore}
				<button id="gallery-cancel-button" type="button" onClick={this.cancel} className="btn btn-flat pull-right toggle-gedit toggler">Cancel</button>
				<button id="gallery-delete-button" type="button" onClick={this.delete} className="btn btn-flat pull-right">Delete</button>
				<button id="gallery-save-button" type="button" onClick={this.save} className="btn btn-flat pull-right">Save</button>
			
			</div>

		);

	},
	revert: function(){

	},
	clear: function(){

		gallery = this.state.gallery;

		gallery.caption = '';
		gallery.tags = [];
		gallery.related_stories = [];
		gallery.articles = [];
		gallery.location = {};

		this.props.updateGallery(gallery);

	},
	addMore: function(){

		document.getElementById('gallery-upload-files').click()

	},
	fileUploaderChanged: function(){
			
		var gallery = this.state.gallery,
			files = this.refs.fileUpload.files,
			self = this;

		//Set gallery files from input file
		gallery.files = files,
		gallery.files.sources = [];

		for (var i = 0; i < files.length; i++){

			var file = files[i];

			var reader = new FileReader();

			reader.onload = (function(index) {

	            return function(e) {

	            	gallery.files.sources.push(e.target.result);

	            	//When we're at the end of the loop, send the state update to the parent
			    	if(index == files.length-1)
			    		self.props.updateGallery(gallery);

	            };

	        })(i);

			reader.readAsDataURL(file);

		}
	},
	cancel: function(){

		$(".toggle-gedit").toggleClass("toggled");

	},
	delete: function(){

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

module.exports = GalleryEditFoot;
