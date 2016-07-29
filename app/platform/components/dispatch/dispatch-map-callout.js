import React from 'react';

/**
 * Dispatch Map Callout componenent
 * @description The callout that shows up on the map after selecting 
 */
export default class DispatchMapCallout extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const { assignment } = this.props;
		const { photo_count, video_count } = assignment;

		return (
			<div className="callout">
				<div className="assignment-callout-main">
					<div className="md-type-body2 assignment-callout-title">
						{assignment.title}
					</div> 
					
					<div className="md-type-body1 assignment-callout-caption">
						{assignment.caption}
					</div> 
					
					<div className="assignment-callout-buttons">
						<span className="mdi mdi-image icon assignment-callout-icon"></span>
						
						<span className="assignment-callout-image-counter">{photo_count}</span>

						<span className="mdi mdi-movie icon assignment-callout-icon"></span>
						
						<span className="assignment-callout-image-counter">{video_count}</span>
						
						<button 
							type="button" 
							className="btn btn-flat assignment-callout-button pull-right"
							id="callout-selector"
							data-id={assignment.id} >
							See All
						</button>
					</div>
				</div>
			</div>

		);
	}
}