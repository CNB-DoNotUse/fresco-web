var React = require('react');
	ReactDOM = require('react-dom'),
	SuggestionList = require('./suggestion-list.js')

/** //

Description : List for a gallery used across the site (/highlights, /content/galleries, etc.)

// **/

/**
 * Gallery List Parent Object 
 */

var GalleryList = React.createClass({

	displayName : 'GalleryList',

	getInitialState: function() {
		return {
			galleries: [],
			offset : 0,
			loading : false
		}
	},
	componentDidMount: function() {

		var self = this;

		this.loadGalleries(0, function(galleries){

			var offset = galleries ? galleries.length : 0;

			//Set galleries from successful response
			self.setState({
				galleries: galleries,
				offset : offset
			});

		});

	},
	//Returns array of galleries with offset and callback
	loadGalleries: function(passedOffset, callback){

		if(this.props.highlighted)

		$.ajax({
			url: API_URL + '/v1/gallery/highlights',
			type: 'GET',
			data: {
				limit: 14,
				offset: passedOffset,
				invalidate: 1
			},
			dataType: 'json',
			success: function(response, status, xhr){
				
				//Do nothing, because of bad response
				if(!response.data || response.err) 
					callback([]);
				else
					callback(response.data);
				
			},
			error: function(xhr, status, error){
				$.snackbar({content: resolveError(error)});
			}
		});

	},
	//Scroll listener for main window
	scroll: function(){

		var grid = this.refs.grid;

		if(!this.state.loading && grid.scrollTop === (grid.scrollHeight - grid.offsetHeight)){

			var self = this;

			self.setState({ loading : true })

			this.loadGalleries(this.state.offset, function(galleries){

				if(!galleries) return;

				var offset = self.state.galleries.length + galleries.length;

				//Set galleries from successful response
				self.setState({
					galleries: self.state.galleries.concat(galleries),
					offset : offset,
					loading : false
				});

			});

		}

	},
	render : function(){

		var half = this.props.half,
			list = '';

		var galleries = <div className="row tiles">
				    		{this.state.galleries.map(function (gallery, i) {
						      	return (
						        	<GalleryCell gallery={gallery} half={half} key={i} />
						      	)
					  		})}
			    		</div>;


		//Check if a list is needed
		if(this.props.withList){

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid" >
			    	<div className="col-md-8">{galleries}</div>
				    <SuggestionList />
		    	</div>
		    );

		}
		else{

			return (
	    		<div className="container-fluid grid" onScroll={this.scroll} ref="grid">
	    			{galleries}
	    		</div>
		    );


		}


	}
});

/**
 * Single Gallery Cell, child of GalleryList
 */

var GalleryCell = React.createClass({

	displayName : 'GalleryCell',

	render : function(){

		var timestamp = this.props.gallery.time_created;
		var timeString = getTimeAgo(Date.now(), this.props.gallery.time_created);
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
	        <li key={i}><a href={"/story/" + story._id}>{story.title}</a></li>
	      )
	    });

		return (
			<ul className="md-type-body2">{stories}</ul>
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
					src={formatImg(this.props.post.image, this.props.size)}
				/>
			</div>
		)
	}
});


module.exports = GalleryList;