import React from 'react'

/**
 * Gallery Edit Foot component
 * @description Contains all the interaction buttons
 */

export default class GalleryEditFoot extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			gallery: _.clone(this.props.gallery, true),
			newFiles: []
		}
		this.revert = this.revert.bind(this);
		this.clear = this.clear.bind(this);
		this.addMore = this.addMore.bind(this);
		this.fileUploaderChanged = this.fileUploaderChanged.bind(this);
		this.delete = this.delete.bind(this);
	}

	revert() {

	}

	clear() {

		var gallery = this.state.gallery;

		gallery.caption = '';
		gallery.tags = [];
		gallery.related_stories = [];
		gallery.articles = [];
		gallery.location = {};
		gallery.files = [];

		this.props.updateGallery(gallery);

	}

	addMore() {

		document.getElementById('gallery-upload-files').click()

	}

	fileUploaderChanged() {
			
		var gallery = this.state.gallery,
			files = this.refs.fileUpload.files,
			self = this;

		//Set gallery files from input file
		gallery.files = files,
		gallery.files.sources = [];

		for (var i = 0; i < files.length; i++){

			var file = files[i];

			var reader = new FileReader();

			reader.onload = ((index) => {

	            return (e) => {

	            	gallery.files.sources.push(e.target.result);

	            	//When we're at the end of the loop, send the state update to the parent
			    	if(gallery.files.sources.length == files.length) {
			    		self.props.updateGallery(gallery);
			    	}

	            };

	        })(i);

			reader.readAsDataURL(file);

		}
	}

	delete() {

		var gallery = this.state.gallery;
		
		alertify.confirm("Are you sure you want to delete this gallery?", (confirmed) => {
			
			if (!confirmed) return;

			//Consturct params with gallery id
			var params = {
				id: gallery._id
			}
			
			//Send delete request
			$.ajax({
				url: "/scripts/gallery/remove",
				method: 'post',
				contentType: "application/json",
				data: params,
				dataType: 'json',
				success: (result) => {
					
					if(result.err){
						return this.error(null, null, result.err);
					};
		
					location.href = document.referrer || '/highlights';

				},
				error: (xhr, status, error) => {
					$.snackbar({
						content: 'Couldn\'t successfully delete this gallery!'
					});
				}
			});

		});

	}

	render() {

		var addMore = '';

		//Check if the gallery has been imported, to show the 'Add More' button or not
		if(this.state.gallery.imported) 
			addMore = <button id="gallery-add-more-button" type="button" onClick={this.addMore} className="btn btn-flat">Add More</button>

		var inputStyle = {
			display: 'none'
		};

		return (
			
			<div className="dialog-foot">
				
				<input 
					id="gallery-upload-files" 
					type="file"  
					accept="image/*,video/*,video/mp4" 
					multiple
					ref='fileUpload'
					style={inputStyle}
					onChange={this.fileUploaderChanged} />

				<button id="gallery-revert-button" type="button" onClick={this.props.revert} className="btn btn-flat">Revert changes</button>
				<button id="gallery-clear-button" type="button" onClick={this.clear} className="btn btn-flat">Clear all</button>
				{addMore}
				<button id="gallery-cancel-button" type="button" onClick={this.props.hide} className="btn btn-flat pull-right toggle-gedit toggler">Cancel</button>
				<button id="gallery-delete-button" type="button" onClick={this.delete} className="btn btn-flat pull-right">Delete</button>
				<button id="gallery-save-button" type="button" onClick={this.props.saveGallery} className="btn btn-flat pull-right">Save</button>
			
			</div>

		);

	}

}
