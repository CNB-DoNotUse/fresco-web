import React from 'react'
import GalleryEditBody from './gallery-edit-body.js'
import GalleryEditFoot from './gallery-edit-foot.js'

/** //

Description : Component for adding gallery editing to the current view

// **/

/**
 * Gallery Edit Parent Object
 */

export default class GalleryEdit extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			gallery: this.props.gallery
		}

		this.updateGallery = this.updateGallery.bind(this);
		this.saveGallery = this.saveGallery.bind(this);

	}

	render() {

		if(!this.props.user) return;

 		return (
 			<div>
	 			<div className="dim toggle-edit">
	 			</div>
	 			<div className="edit panel panel-default toggle-edit gedit">
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
 	}

 	updateGallery(gallery) {
 		//Update new gallery
 		this.setState({ 
 			gallery: gallery 
 		});
 	}

 	saveGallery() {

 		var gallery = this.state.gallery,
 			files = gallery.files ? gallery.files : [],
 			caption = document.getElementById('gallery-edit-caption').value,
 			tags = gallery.tags;	

 		console.log(files);

 		//Generate post ids for update
 		var posts = $('#edit-gallery-images').frick('frickPosts')

 		console.log(posts);

		if(gallery.posts.length + files.length == 0 )
			return $.snackbar({content:"Galleries must have at least 1 post"});


 		//Generate stories for update
 		var stories = gallery.related_stories.map((story) => {

 			if(story.new){
 				return 'NEW=' + JSON.stringify(story)
 			}
 			else
 				return story._id

 		});

 		//Generate articles for update
 		var articles = gallery.articles.map((articles) => {

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
 		if(gallery.posts[0].meta && gallery.posts[0].meta.twitter) {

 			params.other_origin_affiliation =  document.getElementById('gallery-edit-affiliation').value;

 		}
 		//Imported
 		else if(!gallery.posts[0].owner && gallery.posts[0].curator) {

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

 		$.ajax("/scripts/gallery/update", {
 			method: 'post',
 			contentType: "application/json",
 			data: JSON.stringify(params),
 			success: (result) => {

 				if(result.err){
 					$.snackbar({
 						content: "Gallery successfully saved!"
 					});

 				}
 				else{
 					$.snackbar({
 						content: "Gallery successfully saved!"
 					});
 				}
 			}

 		});
 	}

}

class GalleryEditHead extends React.Component {

	constructor(props) {
		super(props);
		this.hide = this.hide.bind(this);
	}

	render() {
		return (
			<div className="dialog-head">
				<span className="md-type-title">Edit Gallery</span>
				<span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.hide}></span>
			</div>
		);
	}

	hide() {
		$(".toggle-edit").toggleClass("toggled");
	}

}