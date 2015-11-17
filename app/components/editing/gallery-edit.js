var React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryEditBody = require('./gallery-edit-body.js'),
	GalleryEditFoot = require('./gallery-edit-foot.js');

/**
 * Gallery Edit Parent Object
 */

 var GalleryEdit = React.createClass({

 	displayName: 'Gallery Edit',

 	getInitialState: function(){

 		return{
 			gallery : this.props.gallery
 		}

 	},

 	render: function(){

 		style ={
 			position: 'absolute',
 			top: '-100px'
 		};

 		return (
 			<div>
	 			<div className="dim toggle-gedit">
	 			</div>
	 			<div className="edit panel panel-default toggle-gedit gedit">
	 				<div className="col-xs-12 col-lg-12 edit-new dialog">
	 					<GalleryEditHead />
	 					<GalleryEditFoot 
	 						updateGallery={this.updateGallery}
	 						gallery={this.state.gallery} />
	 					<GalleryEditBody 
	 						gallery={this.state.gallery}
	 						user={this.props.user}
	 						updateGallery={this.updateGallery} />
	 				</div>
	 			</div>
 			</div>
 		);
 	},
 	updateGallery: function(gallery){
 		//Update new gallery
 		this.setState({ gallery: gallery });
 	}

 });

var GalleryEditHead = React.createClass({

	displayName: 'GalleryEditHead',

	render: function(){
		return (
			<div className="dialog-head">
				<span className="md-type-title">Edit Gallery</span>
				<span className="mdi mdi-close pull-right icon toggle-gedit toggler" onClick={this.hide}></span>
			</div>
		);
	},
	hide: function(){
		$(".toggle-gedit").toggleClass("toggled");
	}

});




module.exports = GalleryEdit;