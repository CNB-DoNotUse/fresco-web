var React = require('react'),
	ReactDOM = require('react-dom'),
	GalleryEditBody = require('./gallery-edit-body.js'),
	GalleryEditFoot = require('./gallery-edit-foot.js');

/** //

Description : Component for adding gallery editing to the current view

// **/

/**
 * Gallery Edit Parent Object
 */

var GalleryEdit = React.createClass({

	displayName: 'Gallery Edit',

	getInitialState: function(){

		return{
			gallery: this.props.gallery
		}

	},

	render: function(){

		if(!this.props.user) return;

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
	 						saveGallery={this.saveGallery}
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
 		this.setState({ 
 			gallery: gallery 
 		});
 	},

 	saveGallery: function(){

 		var gallery = this.state.gallery,
 			files = gallery.files ? gallery.files : [],
 			caption = document.getElementById('gallery-edit-caption').value,
 			tags = gallery.tags;	

 		console.log(files);

 		//Generate post ids for update
 		var posts = $('#edit-gallery-images').frick('frickPosts')

 		console.log(posts);

 		return;

		if(gallery.posts.length + files.length == 0 )
			return $.snackbar({content:"Galleries must have at least 1 post"});


 		//Generate stories for update
 		var stories = gallery.related_stories.map(function(story){

 			if(story.new){
 				return 'NEW=' + JSON.stringify(story)
 			}
 			else
 				return story._id

 		});

 		//Generate articles for update
 		var articles = gallery.articles.map(function(articles){

 			if(articles.new){
 				return 'NEW=' + JSON.stringify(articles)
 			}
 			else
 				return articles._id

 		});	

 		//Configure params for the updated gallery
 		var params = {
 			id: gallery._id,
 			caption: caption,
 			posts: posts,
 			tags: tags,
 			visibility: 1,
 			stories: stories,
 			articles: articles
 		};

 		//Configure the byline's other origin
 		//From twitter
 		if(gallery.posts[0].meta && gallery.posts[0].meta.twitter){

 			params.other_origin_affiliation =  document.getElementById('gallery-edit-affiliation').value;

 		}
 		//Imported
 		else if(!gallery.posts[0].owner && gallery.posts[0].curator){

 			params.other_origin_name = document.getElementById('gallery-edit-name').value;
 			params.other_origin_affiliation =  document.getElementById('gallery-edit-affiliation').value;

 		}

 		if (gallery.imported) {
 			params.lat = marker.getPosition().lat();
 			params.lon = marker.getPosition().lng();
 			if (gallery.location.address) {
 				params.address = document.getElementById('gallery-location-input').value;
 			}
 		}

 		console.log(params);

 		$.ajax("/scripts/gallery/update", {
 			method: 'post',
 			contentType: "application/json",
 			data: JSON.stringify(params),
 			success: function(result){

 				console.log(result);
 			
 				$.snackbar({
 					content: "Gallery successfully saved!"
 				});

 			},
 			error: function(xhr, status, error){
 				
 				$.snackbar({
 					content: "We ran into an error saving your gallery"
 				});

 			}

 		});
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