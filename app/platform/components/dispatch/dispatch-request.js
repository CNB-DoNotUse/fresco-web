import React from 'react';
import api from 'app/lib/api';

/**
 * Card component
 * @description Card that shows up when Dispatch is disabled for the user
 */
export default class DispatchRequest extends React.Component {

	constructor(props) {
		super(props);

		this.submitRequest = this.submitRequest.bind(this);
	}

	state = {
		toggled: false,
		requesting: false
	}

	submitRequest() {
		if(this.state.requesting) return;

		this.setState({ requesting: true });

		api.post('outlet/dispatch/request', {
			comment: this.refs.comment.value
		})
        .then(res => {
    		$.snackbar({
    			content: 'We\'ve received your request and will be in touch soon!'
    		});

    		this.hide();
        })
        .catch(() => 
        	$.snackbar({ content: 'We were unable to process your request!' })
        )
        .then(() => 
        	this.setState({ requesting: false })
        );
	}

	hide = () => {
		this.setState({ toggled: true })
	}

	render() {
		return (
			<div className={`card panel toggle-card ${this.state.toggled ? 'toggled' : ''}`}>
				<div className="card-head">
					<span className="md-type-title">Request access to Dispatch</span>
					<span 
						id="close-request-access-window" 
						className="mdi mdi-close pull-right icon toggle-card toggler"
						onClick={this.hide}
					>
					</span>
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