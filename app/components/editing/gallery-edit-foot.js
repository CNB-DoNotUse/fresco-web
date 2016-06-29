import React, { PropTypes } from 'react'

/**
 * Gallery Edit Foot component
 * @description Contains all the interaction buttons
 */

class GalleryEditFoot extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			gallery: _.clone(this.props.gallery, true),
			newFiles: []
		}

		this.clear = this.clear.bind(this);
		this.addMore = this.addMore.bind(this);
		this.fileUploaderChanged = this.fileUploaderChanged.bind(this);
		this.delete = this.delete.bind(this);
	}

	clear() {
		var gallery = this.state.gallery;

		gallery.caption = '';
		gallery.tags = [];
		gallery.related_stories = [];
		gallery.articles = [];
		gallery.location = {};
		gallery.files = [];
		gallery.assignment = null;

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
        const gallery = this.state.gallery;

        alertify.confirm("Are you sure you want to delete this gallery?", (confirmed) => {
            if (!confirmed) return;

            // Consturct params with gallery id
            const params = { id: gallery.id };

            // Send delete request
            $.ajax({
                url: '/api/gallery/remove',
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify(params),
                dataType: 'json',
                success: (result) => {
                    if (result.err) {
                        return this.error(null, null, result.err);
                    }

                    if (window.location.href.indexOf('post') === -1) {
                        return location.reload();
                    }
                    location.href = document.referrer || '/highlights';

                    return null;
                },
                error: () => {
                    $.snackbar({ content: 'Couldn\'t successfully delete this gallery!' });
                },
            });
        });
    }

    render() {
        let addMore = '';
        let verifyToggle = '';
        const {
            verifyGallery,
            unverifyGallery,
            revert,
            saveGallery,
            hide,
        } = this.props;
        const { gallery } = this.state;

        //Check if the gallery has been imported, to show the 'Add More' button or not
        if (gallery.imported) {
            addMore = (
                <button
                    type="button"
                    onClick={this.addMore}
                    className="btn btn-flat">
                    Add More
                </button>
            );
        }

		var inputStyle = {
			display: 'none'
		};

        if (gallery.visibility == 0) {
            verifyToggle = (
                <button
                    type="button"
                    onClick={verifyGallery}
                    className="btn btn-flat pull-right">
                    Verify
                </button>
            );
        } else {
            verifyToggle = (
                <button
                    onClick={unverifyGallery}
                    className="btn btn-flat pull-right">
                    Unverify
                </button>
            );
        }

        return (
			<div className="dialog-foot">
				<input
					id="gallery-upload-files"
					type="file"
					accept="image/*,video/*,video/mp4"
					multiple
					ref='fileUpload'
					style={inputStyle}
                    onChange={this.fileUploaderChanged}
                />

                <button
                    type="button"
					onClick={revert}
                    className="btn btn-flat">
                    Revert changes
                </button>

                <button
                    type="button"
					onClick={this.clear}
                    className="btn btn-flat">
                    Clear all
                </button>

				{addMore}

                <button
                    type="button"
					onClick={saveGallery}
                    className="btn btn-flat pull-right">
                    Save
                </button>

				{verifyToggle}

                <button
                    type="button"
                    onClick={this.delete}
                    className="btn btn-flat pull-right">
                    Delete
                </button>

                <button
                    type="button"
                    onClick={hide}
                    className="btn btn-flat pull-right toggle-gedit toggler">
                    Cancel
                </button>
			</div>
		);
    }
}


GalleryEditFoot.defaultProps = {
	hide: function () { console.log('Hide not implemented in GalleryEdit'); }
};

GalleryEditFoot.propTypes = {
    verifyGallery: PropTypes.func.isRequired,
    unverifyGallery: PropTypes.func.isRequired,
    saveGallery: PropTypes.func.isRequired,
    revert: PropTypes.func.isRequired,
    hide: PropTypes.func.isRequired,
};

export default GalleryEditFoot;

