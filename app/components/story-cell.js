var React = require('react');
	ReactDOM = require('react-dom');

/**
 * Single Story Cell, child of StoryList
 */

var StoryCell = React.createClass({

	displayName : 'StoryCell',

	render : function(){

		// var size = half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';

		var timestamp = this.props.story.time_created;
		var timeString = formatTime(this.props.story.time_created);

		return(
			<div className='col-xs-6 col-md-3 tile story'>
				<div className="tile-body">
					<div className="frame"></div>
					<div className="hover">
						<p className="md-type-body1">{this.props.story.caption}</p>
						<ul className="md-type-body2">
							<li>{this.props.story.gallery_count + ' gallery' + (this.props.story.gallery_count == 1 ? 's' : '')}</li>
						</ul>
					</div>
					<StoryCellImages thumbnails={this.props.story.thumbnails} />
				</div>
				<div className="tile-foot">
					<div className="hover">
						<a href={'/story/'+ this.props.story._id} className="md-type-body2">See all</a>
					</div>
					<div>
						<div>
							<span className="md-type-body2">{this.props.story.title}</span>
							<span className="md-type-caption timestring" data-timestamp={timestamp}>{timeString}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
});


/**
 * Post Cell Images
 */

var StoryCellImages = React.createClass({

	displayName : "StoryCellImages",

	render : function(){

		if (!this.props.thumbnails || this.props.thumbnails.length == 0){
			return (
				<div className="flex-row"></div>
			);
		}
		else if (this.props.thumbnails.length == 1){
			return(
				<div className="flex-row">
					<StoryCellImage post={this.props.thumbnails[0]} size="small" />
				</div>
			);
		}
		else if(this.props.thumbnails.length < 5){

			return(
				<div className="flex-row">
					<StoryCellImage post={this.props.thumbnails[0]} size="small" />
					<StoryCellImage post={this.props.thumbnails[1]} size="small" />
				</div>
			);

		}
		else if(this.props.thumbnails.length >= 5 && this.props.thumbnails.length < 8){
			return(

				<div className="flex-row">
					<div className="flex-col">
						<StoryCellImage post={this.props.thumbnails[0]} size="small" />
					</div>
					<div className="flex-col">
						<div className="flex-row">
							<StoryCellImage post={this.props.thumbnails[0]} size="small" />
							<StoryCellImage post={this.props.thumbnails[1]} size="small" />
						</div>
						<div className="flex-row">
							<StoryCellImage post={this.props.thumbnails[3]} size="small" />
							<StoryCellImage post={this.props.thumbnails[3]} size="small" />
						</div>
					</div>
				</div>
			);
		}
		else if(this.props.thumbnails.length >= 8){

			return(
				<div className="flex-col">
					<div className="flex-row">
						<StoryCellImage post={this.props.thumbnails[0]} size="small" />
						<StoryCellImage post={this.props.thumbnails[1]} size="small" />
						<StoryCellImage post={this.props.thumbnails[2]} size="small" />
						<StoryCellImage post={this.props.thumbnails[3]} size="small" />
					</div>
					<div className="flex-row">
						<StoryCellImage post={this.props.thumbnails[0]} size="small" />
						<StoryCellImage post={this.props.thumbnails[2]} size="small" />
						<StoryCellImage post={this.props.thumbnails[3]} size="small" />
						<StoryCellImage post={this.props.thumbnails[4]} size="small" />
					</div>
				</div>
			);
		}
	}

});

/**
 * Single Post Cell Image Item
 */

var StoryCellImage = React.createClass({

	displayName : 'StoryCellImage',

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

module.exports = StoryCell;
