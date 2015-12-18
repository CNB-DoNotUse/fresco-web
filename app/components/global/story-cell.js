import React from 'react'
import FrescoImage from './fresco-image'
import global from '../../../lib/global'

/**
 * Single Story Cell, child of StoryList
 */

export default class StoryCell extends React.Component {

	render() {

		// var size = half ? 'col-xs-6 col-md-3' : 'col-xs-12 col-md-6';

		var timestamp = this.props.story.time_created || this.props.story.time_edited;
		var timeString = global.formatTime(timestamp);

		return(
			<div className='col-xs-6 col-md-3 tile story'>
				<div className="tile-body">
					<div className="frame"></div>
					<div className="hover">
						<p className="md-type-body1">{this.props.story.caption}</p>
						<ul className="md-type-body2">
							<li>{this.props.story.gallery_count + ' ' + (this.props.story.gallery_count == 1 ? 'gallery' : 'galleries')}</li>
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
}


/**
 * Post Cell Images
 */

class StoryCellImages extends React.Component {

	render() {

		if (!this.props.thumbnails || this.props.thumbnails.length == 0){
			return (
				<div className="flex-row"></div>
			);
		}
		else if (this.props.thumbnails.length == 1){
			return(
				<div className="flex-row">
					<FrescoImage post={this.props.thumbnails[0]} size="small" />
				</div>
			);
		}
		else if(this.props.thumbnails.length < 5){

			return(
				<div className="flex-row">
					<FrescoImage image={this.props.thumbnails[0].image} size="small" />
					<FrescoImage image={this.props.thumbnails[1].image} size="small" />
				</div>
			);

		}
		else if(this.props.thumbnails.length >= 5 && this.props.thumbnails.length < 8){
			return(

				<div className="flex-row">
					<div className="flex-col">
						<FrescoImage post={this.props.thumbnails[0]} size="small" />
					</div>
					<div className="flex-col">
						<div className="flex-row">
							<FrescoImage image={this.props.thumbnails[0].image} size="small" />
							<FrescoImage image={this.props.thumbnails[1].image} size="small" />
						</div>
						<div className="flex-row">
							<FrescoImage image={this.props.thumbnails[3].image} size="small" />
							<FrescoImage image={this.props.thumbnails[3].image} size="small" />
						</div>
					</div>
				</div>
			);
		}
		else if(this.props.thumbnails.length >= 8){

			return(
				<div className="flex-col">
					<div className="flex-row">
						<FrescoImage image={this.props.thumbnails[0].image} size="small" />
						<FrescoImage image={this.props.thumbnails[1].image} size="small" />
						<FrescoImage image={this.props.thumbnails[2].image} size="small" />
						<FrescoImage image={this.props.thumbnails[3].image} size="small" />
					</div>
					<div className="flex-row">
						<FrescoImage image={this.props.thumbnails[0].image} size="small" />
						<FrescoImage image={this.props.thumbnails[2].image} size="small" />
						<FrescoImage image={this.props.thumbnails[3].image} size="small" />
						<FrescoImage image={this.props.thumbnails[4].image} size="small" />
					</div>
				</div>
			);
		}
	}

}