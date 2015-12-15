import _ from 'lodash'
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
		this.revertGallery = this.revertGallery.bind(this);
		this.saveGallery = this.saveGallery.bind(this);

	}

	render() {
		var GalleryBody = '';
		if(this.props.gallery) {
			GalleryBody =
				<div className="col-xs-12 col-lg-12 edit-new dialog">
 					<GalleryEditHead hide={this.props.hide} />
 					<GalleryEditBody 
 						gallery={this.props.gallery}
 						updateGallery={this.updateGallery} />
 					<GalleryEditFoot 
 						updateGallery={this.updateGallery}
 						revert={this.revertGallery}
 						saveGallery={this.saveGallery}
 						gallery={this.props.gallery} />
 				</div>
		}

 		return (
 			<div>
	 			<div className={'dim toggle-edit' + (this.props.toggled ? ' toggled' : '')}>
	 			</div>
	 			<div className={"edit panel panel-default toggle-edit gedit" + (this.props.toggled ? ' toggled' : '')}>
	 				{GalleryBody}
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

 	revertGallery() {
 		// Set gallery back to original
 		this.setState({
 			gallery: _.clone(this.props.gallery, true)
 		})
 	}

 	saveGallery() {
 		console.log('save clicked');	
 		var gallery = _.clone(this.state.gallery, true),
 			files = gallery.files ? gallery.files : [],
 			caption = gallery.caption,
 			tags = gallery.tags;	

 		//Generate post ids for update
 		var posts = [];
 		for(var p in gallery.posts) {
 			posts.push(gallery.posts[p]._id);
 		}

		if(gallery.posts.length + files.length == 0 )
			return $.snackbar({content:"Galleries must have at least 1 post"});


 		//Generate stories for update
 		var stories = [];
 		gallery.related_stories.map((story) => {

 			if(story.new){
 				stories.push('NEW=' + JSON.stringify(story));
 			}
 			else
 				stories.push(story._id);

 		});

 		//Generate articles for update
 		var articles = [];
 		gallery.articles.map((articles) => {

 			if(articles.new){
 				articles.push('NEW=' + JSON.stringify(articles));
 			}
 			else
 				articles.push(articles._id);

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
	}

	render() {
		return (
			<div className="dialog-head">
				<span className="md-type-title">Edit Gallery</span>
				<span className="mdi mdi-close pull-right icon toggle-edit toggler" onClick={this.props.hide}></span>
			</div>
		);
	}

}

GalleryEdit.defaultProps = {
	gallery: null,
	toggled: false,
	hide: () => {}
}
