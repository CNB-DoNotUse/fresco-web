import React from 'react';
import DispatchAssignments from './dispatch-assignments'
import DispatchSubmit from './dispatch-submit'

/** //

Description : The container for the map element in the dispatch page

// **/

/**
 * Dispatch Map component
 */

export default class DispatchCards extends React.Component {

	constructor(props) {
		super(props);
	}


	render() {

		//Check if the user has an outlet and they're enabled for dispatch
		if (this.props.user.outlet && this.props.user.outlet.dispatch_enabled) {
				
			return (
				<div className="cards">
					<DispatchAssignments 
						user={this.props.user} 
						toggleSubmission={this.toggleSubmission}
						setActiveAssignment={this.props.setActiveAssignment} />	
					<DispatchSubmit user={this.props.user} />
				</div>
			)	

		}
		//Otherwise present the `Request Access` card
		else{
			
			return(
				
				<div className="cards">
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
				</div>

			);

		}
	}

	/**
	 * Toggles Assignment submission window
	 * @param  {BOOL} show To show or hide the window
	 */
	toggleSubmissionCard(show, event) {

		var dispatchSubmit = document.getElementById('dispatch-submit');

		if(show){

			dispatchSubmit.className = dispatchSubmit.className.replace(/\btoggled\b/,'');

		}
		else{

			dispatchSubmit.className += 'toggled';

		}


	}

}

