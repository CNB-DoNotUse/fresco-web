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
 		this.setState({ gallery: gallery });
 	},

 	saveGallery: function(){

 		var gallery = this.state.gallery,
 			caption = document.getElementById('gallery-edit-caption').value,
 			tags = gallery.tags;	

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

 		//Configure the byline's other origin
 		if(post.meta && post.meta.twitter){
 			
 			params.other_origin_affiliation =  document.getElementById('gallery-edit-affiliation').value()
 		}
 		else if(!post.owner && post.curator){

 			params.other_origin_name = document.getElementById('gallery-edit-name').value();
 			params.other_origin_affiliation =  document.getElementById('gallery-edit-affiliation').value()

 		}

 		if (gallery.imported) {
 			params.lat = galery.location.getPosition().lat();
 			params.lon = galleryEditMarker.getPosition().lng();
 			if (gallery.location.address) {
 				params.address = $('#gallery-location-input').val();
 			}
 		}


 		var params = {
 			id: gallery._id,
 			caption: caption,
 			byline: byline,
 			posts: posts,
 			tags: tags,
 			visibility: visibility != null ? visibility : undefined,
 			stories: stories,
 			articles: articles
 		};

 		$.ajax("/scripts/gallery/update", {
 			
 			method: 'post',
 			contentType: "application/json",
 			data: JSON.stringify(params),
 			success: function(result){
 			
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

 		$.ajax({
 			url: '/scripts/gallery/addpost',
 			type: 'POST',
 			data: data,
 			processData: false,
 			contentType: false,
 			cache: false,
 			dataType: 'json',
 			success: function(result, status, xhr){
 				
 			},
 			error: function(xhr, status, error){
 				$.snackbar({content: resolveError(err)});
 			}
 		});

 		/*
 			
 			Byline : Send over other_origin object
 				
 				//Twitter
 					other_origin = {
 						affiliation: whatevers in the field 
 						name: handle or user_name
 					}
 					byline = name + affiliation ? ' / ' + affiliation : 'via Fresco News'
 				//Manual Import

 		 */
 		
 		
 		// var visibility = null;

 		// if ($('#gallery-other-origin').css('display') !== 'none') {
 		// 	byline = $('#gallery-name-input').val().trim() + ' / ' + $('#gallery-affiliation-input').val().trim();
 		// 	other_origin = {
 		// 		name: $('#gallery-name-input').val().trim(),
 		// 		affiliation: $('#gallery-affiliation-input').val().trim(),
 		// 	}
 		// }

 		// var added = posts.filter(function(id) {return id.indexOf('NEW') !== -1});

 		// added = added.map(function(index) {
 		// 	index = index.split('=')[1];
 		// 	return GALLERY_EDIT.files[index];
 		// });

 		// posts = posts.filter(function(id) {return id.indexOf('NEW') == -1});

 		// if (posts.length == 0)
 		// 	return $.snackbar({content:"Galleries must have at least 1 post"});

 		// if( $('#gallery-highlight-input').length !== 0 && galleryEditVisibilityChanged == 1)
 		// 	visibility = $('#gallery-highlight-input').prop('checked') ? 2 : 1;

 		// updateGallery(caption, byline, tags, posts, visibility, other_origin, function(err, GALLERY_EDIT){
 			
 		// 	if (err)
 		// 		return $.snackbar({content: resolveError(err)});

 		// 	if (added.length > 0) {
 				
 		// 		var data = new FormData();
 				
 		// 		for (var index in added) {
 		// 			data.append(index, added[index]);
 		// 		}

 		// 		data.append('gallery', GALLERY_EDIT._id);
 				
 		// 		$.ajax({
 		// 			url: '/scripts/gallery/addpost',
 		// 			type: 'POST',
 		// 			data: data,
 		// 			processData: false,
 		// 			contentType: false,
 		// 			cache: false,
 		// 			dataType: 'json',
 		// 			success: function(result, status, xhr){
 		// 				window.location.reload();
 		// 			},
 		// 			error: function(xhr, status, error){
 		// 				$.snackbar({content: resolveError(err)});
 		// 			}
 		// 		});

 		// 	}
 		// 	else
 		// 		window.location.reload();
 		// });

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