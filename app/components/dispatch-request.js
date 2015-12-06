import React from 'react';

/** //

Description : Card that shows up when Dispatch is disabled for the user

// **/

/**
 * Card component
 */

export default class DispatchRequest extends React.Component {

	render() {

		<div className="card panel toggle-card">
			<div className="card-head">
				<span className="md-type-title">Request Access</span>
				<span id="close-request-access-window" className="mdi mdi-close pull-right icon toggle-card toggler"></span>
			</div>
			
			<div className="card-foot center">
				<button id="request-dispatch-submit" type="button" className="btn btn-flat toggle-card toggler">Submit</button>
			</div>
			
			<div className="card-body">
				<div className="form-group-default">
					<textarea id="request-access-comment" type="text" className="form-control f sloating-label" placeholder="Comments (optional)"></textarea>
				</div>
			</div>
		</div>

	}
}	
