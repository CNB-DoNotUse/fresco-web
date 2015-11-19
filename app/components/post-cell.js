var React = require('react');
	ReactDOM = require('react-dom'),
	PurchaseAction = require('./actions/purchase-action.js'),
	DownloadAction = require('./actions/download-action.js');

/**
 * Single Post Cell, child of PostList
 */

var PostCell = React.createClass({

	displayName: 'PostCell',

	getDefaultProps: function() {
		return {
			sizes: {
				large: 'col-xs-12 col-sm-6 col-lg-4',
				small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2'
			}
		};
	},

	render : function(){

		var timestamp = this.props.post.time_created;
		var timeString = formatTime(this.props.post.time_created);
		var address = this.props.post.location.address || 'No Location';
		var size = this.props.sizes.large;

		//Class name for post tile icons
		var statusClass = 'mdi icon pull-right ';
		statusClass += this.props.post.video == null ? 'mdi-file-image-box ' : 'mdi-movie ';
		statusClass += this.props.post.purchased ? 'available ' : 'md-type-black-disabled ';

		if(this.props.size == 'small')
			size = this.props.sizes.small;

		return(

			<div className={size + ' tile'}>
				<div className="tile-body">
					<div className="frame"></div>
						<div className="hover">
							<p className="md-type-body1">{this.props.post.caption}</p>
							<span className="md-type-caption">{this.props.post.byline}</span>
							<PostCellStories stories={this.props.post.stories} />
						</div>
					<div className="img">
						<img className="img-cover" src={formatImg(this.props.post.image, 'small')} />
					</div>
				</div>
				<div className="tile-foot">
					<PostCellActions
						post={this.props.post}
						purchased={this.props.purchased}
						rank={this.props.rank}
						editable={this.props.editable} />
					<div>
						<div className="tile-info">
						  	<span className="md-type-body2">{address}</span>
							<span className="md-type-caption timestring" data-timestamp={this.props.post.time_created}>{timeString}</span>
						</div>
						<span className={statusClass}></span>
					</div>
				</div>
			</div>

		)
	}
});

// <span className="mdi mdi-library-plus icon pull-right"></span>
// <span className="mdi mdi-download icon toggle-edit toggler pull-right" onClick={this.downloadGallery} ></span>

/**
 * Gallery Cell Stories List
 */

var PostCellStories = React.createClass({

	displayName : 'Post Cell Stories',

	render : function(){

		var stores = ''

		if(this.props.stories){

			var stories = this.props.stories.map(function (story, i) {

		      return (

		        <li key={i}>
		        	<a href={"/story/" + story._id}>{story.title}</a>
		        </li>

		      )

		    });

		}

		return (
			<ul className="md-type-body2">{stories}</ul>
		);
	}

});

/**
 * Post Cell Actions
 * Description : Set of icons on the the post cell's hover
 */

var PostCellActions = React.createClass({

	displayName: 'Post Cell Actions',

	render : function(){

		var actions = [],
			key = 0;
		//Check if the purchased property is set on the post
		if (this.props.post.purchased !== null){

			//Check if we're CM or Admin
			if(typeof this.props.rank !== 'undefined' && this.props.rank >= 1) {

				if(this.props.post.purhcased === false){

					if(this.props.editable)
						actions.push(<span className="mdi mdi-pencil icon pull-right toggle-gedit toggler" onClick={this.edit} key={key++}></span>);

					actions.push(<PurchaseAction post={this.post} />);

					actions.push(<span className="mdi mdi-cash icon pull-right" data-id={this.props.post._id} onClick={this.purchase} key={key++}></span>);

				}
				else{

					if(this.props.editable)
						actions.push(<span className="mdi mdi-pencil icon pull-right toggle-gedit toggler" onClick={this.edit} key={key++}></span>);

					actions.push(<span className="mdi mdi-download icon pull-right" onClick={this.download} key={key++}></span>);

				}

			}
			//Check if the post has been purchased
			else if (this.props.post.purhcased === true)
				actions.push(<span className="mdi mdi-download icon pull-right" onClick={this.download} key={key++}></span>);

			//Check if the post is not purhcased, and it is for sale
			else if (this.props.post.purchased == false && forsale) {

				actions.push(<span class="mdi mdi-library-plus icon pull-right" key={key++}></span>);
				actions.push(<span class="mdi mdi-cash icon pull-right" data-id="' + post._id + '" key={key++}></span>);


			}

		}

		return (
			<div className="hover">
				<a className="md-type-body2 post-link" href={'/post/'+ this.props.post._id}>See more</a>
				{actions}
			</div>
		);

	},
	edit: function(){

		// $.ajax({
		// 	url: '/scripts/post/gallery',
		// 	type: 'GET',
		// 	data: {id: post._id},
		// 	success: function(result, status, xhr){
		// 		if (result.err)
		// 			return this.error(null, null, result.err);

		// 		GALLERY_EDIT = result.data;
		// 		galleryEditUpdate();
		// 		$(".toggle-gedit").toggleClass("toggled");
		// 	},
		// 	error: function(xhr, status, error){
		// 		$.snackbar({content:resolveError(error)});
		// 	}
		// })

	}

});


module.exports = PostCell;
