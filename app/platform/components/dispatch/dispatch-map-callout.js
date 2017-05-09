import React from 'react';

/**
 * Dispatch Map Callout componenent
 * @description The callout that shows up on the map after selecting 
 */
export default class DispatchMapCallout extends React.Component {

	constructor(props) {
		super(props);
	}

	clicked() {
		 window.location.assign(`/assignment/${this.props.assignment.id}`)
	}

	render() {
		const { assignment } = this.props;
		const { photo_count, video_count, accepted_count } = assignment;

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
						<div className="assignment-callout-stats">
							<span className="mdi mdi-image icon assignment-callout-icon"></span>
							
							<span className="assignment-callout-image-counter">{photo_count}</span>

							<span className="mdi mdi-movie icon assignment-callout-icon"></span>
							
							<span className="assignment-callout-image-counter">{video_count}</span>

							<span className="mdi mdi-account icon assignment-callout-icon"></span>
							
							<span className="assignment-callout-image-counter">{accepted_count}</span>
						</div>

						<button 
							type="button" 
							className="btn btn-flat assignment-callout-button pull-right"
							id="callout-selector"
							onClick={this.clicked}
							data-id={assignment.id} >
							See All
						</button>
					</div>
				</div>
			</div>

		);
	}
}