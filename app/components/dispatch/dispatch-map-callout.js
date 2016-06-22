import React from 'react';

/** //

Description : The callout that shows up on the map after selecting 

// **/

/**
 * Dispatch Map Callout componenent
 */

export default class DispatchMapCallout extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {

		var assignment = this.props.assignment;

		return (
			<div className="callout">
				<div className="assignment-callout-main">
					<div className="md-type-body2 assignment-callout-title">{assignment.title}</div> 
					
					<div className="md-type-body1 assignment-callout-caption">{assignment.caption}</div> 
					
					<div className="assignment-callout-buttons">
						<span className="mdi mdi-image icon assignment-callout-icon"></span>
						
						<span className="assignment-callout-image-counter">{assignment.posts.length}</span>
						
						<button 
							type="button" 
							className="btn btn-flat assignment-callout-button pull-right"
							id="callout-selector"
							data-id={assignment._id} >
							See All
						</button>
					</div>
				</div>
			</div>

		);
	}
}