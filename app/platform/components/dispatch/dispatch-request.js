import React from 'react';

/** //

Description : Card that shows up when Dispatch is disabled for the user

// **/

/**
 * Card component
 */

export default class DispatchRequest extends React.Component {

	constructor(props) {
		super(props);

		this.submitRequest = this.submitRequest.bind(this);
	}

	submitRequest() {

		if(this.requesting) return;

		this.requesting = true;

		$.ajax({
			method: 'post',
			url: '/api/outlet/dispatch/request',
			data: JSON.stringify({
				comment: this.refs.comment.value
			}),
			contentType: 'application/json',
			success: (result) => {
				this.requesting = false;

				if(!result.err){

					$.snackbar({
						content: 'We\'ve received your request and will be in touch soon!'
					});

					this.refs['request-card'].className += ' toggled';

				} else{
					$.snackbar({
						content: utils.resolveError(result.err, 'We ran into an error submitting your request! Please contact us directly at info@fresconews.com')
					});
				}
			}
		});
	}

	render() {

		return (
			<div className="card panel toggle-card" ref="request-card">
				<div className="card-head">
					<span className="md-type-title">Request access to Dispatch</span>
					<span id="close-request-access-window" className="mdi mdi-close pull-right icon toggle-card toggler"></span>
				</div>
				
				<div className="card-foot center">
					<button 
						id="request-dispatch-submit" 
						type="button" 
						className="btn btn-flat toggle-card toggler"
						onClick={this.submitRequest}>Submit</button>
				</div>
				
				<div className="card-body">
					<div className="form-group-default">
						<textarea 
							ref="comment" 
							type="text" 
							className="form-control floating-label" 
							placeholder="Comments (optional)"></textarea>
					</div>
				</div>
			</div>
		);
	}

}	
