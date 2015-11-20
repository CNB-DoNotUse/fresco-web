import React from 'react';

/**
 * Single Gallery Cell, child of GalleryList
 */

var GalleryCell = React.createClass({

	displayName : 'GalleryCell',

	getDefaultProps: function() {
		return {
			//Size of the cell
			half: false
		};
	},

	render : function(){

		var timestamp = this.props.gallery.time_created;
		var timeString = formatTime(this.props.gallery.time_created);
		var size = this.props.half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';
		var location = 'No Location';

		for (var i = 0; i < this.props.gallery.posts.length; i++) {
			if (this.props.gallery.posts[i].location.address){
				location = this.props.gallery.posts[i].location.address;
				break;
			}
		}

		return (
			<div className={size + " tile story"}>
				<div className="frame"></div>
				<div className="tile-body">
					<div className="hover">
						<p className="md-type-body1">{this.props.gallery.caption}</p>
						<GalleryCellStories stories={this.props.gallery.related_stories} />
					</div>
					<GalleryCellImages posts={this.props.gallery.posts} />
				</div>
				<div className="tile-foot">
					<div className="hover">
						<a href={"/gallery/" + this.props.gallery._id} className="md-type-body2">See all</a>
					</div>
					<div>
						<div className="ellipses">
							<span className="md-type-body2">{location}</span>
							<span className="md-type-caption timestring" data-timestamp={this.props.gallery.time_created}>{timeString}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

// <span className="mdi mdi-library-plus icon pull-right"></span>
// <span className="mdi mdi-download icon toggle-edit toggler pull-right" onClick={this.downloadGallery} ></span>

/**
 * Gallery Cell Stories List
 */

var GalleryCellStories = React.createClass({

	displayName : "GalleryCellStories",

	render : function(){

		var stories = this.props.stories.map(function (story, i) {
	      return (
	        <li key={i}>
	        	<a href={"/story/" + story._id}>{story.title}</a>
	        </li>
	      )
	    });

		return (
			<ul className="md-type-body2 story-list">{stories}</ul>
		);
	}

});

/**
 * Gallery Cell Images
 */

var GalleryCellImages = React.createClass({

	displayName : "GalleryCellImages",

	render : function(){

		if (!this.props.posts || this.props.posts.length == 0){

			return (
				<div className="flex-row"></div>
			);

		}
		else if (this.props.posts.length == 1){

			return (
				<div className="flex-row">
					<GalleryCellImage post={this.props.posts[0]} size="small" />
				</div>
			);
		}
		else if(this.props.posts.length < 5){

			return (
				<div className="flex-row">
					<GalleryCellImage post={this.props.posts[0]} size="small" />
					<GalleryCellImage post={this.props.posts[1]} size="small" />
				</div>
			);
		}
		else if(this.props.posts.length >= 5 && this.props.posts.length < 8){

			return (
				<div className="flex-row">
					<div className="flex-col">
						<GalleryCellImage post={this.props.posts[0]} size="small" />
					</div>
					<div className="flex-col">
						<div className="flex-row">
							<GalleryCellImage post={this.props.posts[1]} size="small" />
							<GalleryCellImage post={this.props.posts[2]} size="small" />
						</div>
						<div className="flex-row">
							<GalleryCellImage post={this.props.posts[3]} size="small" />
							<GalleryCellImage post={this.props.posts[4]} size="small" />
						</div>
					</div>
				</div>
			);

		}
		else if(this.props.posts.length >= 8){

			return (
				<div className="flex-col">
					<div className="flex-row">
						<GalleryCellImage post={this.props.posts[0]} size="small" />
						<GalleryCellImage post={this.props.posts[1]} size="small" />
						<GalleryCellImage post={this.props.posts[4]} size="small" />
						<GalleryCellImage post={this.props.posts[3]}  size="small" />
					</div>
					<div className="flex-row">
						<GalleryCellImage post={this.props.posts[4]} size="small" />
						<GalleryCellImage post={this.props.posts[5]} size="small" />
						<GalleryCellImage post={this.props.posts[6]} size="small" />
						<GalleryCellImage post={this.props.posts[7]} size="small" />
					</div>
				</div>
			);
		}
	}

});

/**
 * Single Gallery Cell Image Item
 */

var GalleryCellImage = React.createClass({

	displayName : 'GalleryCellImage',

	render : function(){
		return (
			<div className="img">
				<img className="img-cover"
					data-src={formatImg(this.props.post.image, this.props.size)}
					src={formatImg(this.props.post.image, this.props.size)} />
			</div>
		)
	}
});

module.exports = GalleryCell;
