import React from 'react'
import global from '../../../lib/global'

/**
 * Global purchase actions
 */

export default class PurchaseAction extends React.Component {

	constructor(props) {
		super(props);
		this.purchase = this.purchase.bind(this);
	}

	render() {

		return(
			<span className="mdi mdi-cash icon pull-right" onClick={this.purchase}></span>
		);
		
	}

	//Called whenever the purhcase icon is selected
	purchase(event) {

		//Check if the prop exists first
		if(!this.props.post) return;

		var post = this.props.post._id,
			assignment = this.props.assignment ? this.props.assignment._id : null

		//Confirm the purchase
		alertify.confirm("Are you sure you want to purchase? This will charge your account. Content from members of your outlet may be purchased free of charge.", (e) => {

			//Clicked 'Yes'
		    if (e) {
				//Send request for purchase
				$.ajax({
					url: '/scripts/outlet/checkout',
					dataType: 'json',
					method: 'post',
					contentType: "application/json",
					data: JSON.stringify({
						posts: [post],
						assignment: assignment
					}),
					success: (result, status, xhr) => {

						if (result.err) {
							return $.snackbar({
								content: global.resolveError(result.err, 'There was an error while completing your purchase! Please double check your payment info.')
							});
						} else if(result.data.length == 0){
							return $.snackbar({
								content: 'There was an error while completing your purchase!'
							});
						}

						$.snackbar({
							content:'Purchase successful! Visit your outlet page or click to view your purchased content'
						}).click(() => {
							window.location = '/outlet';
						});

						this.props.didPurchase(this.props.post._id);

					},
					error: (xhr, status, error) => {
						$.snackbar({
							content: global.resolveError(error, 'There was an error while completing your purchase!')
						});
					}
				});
		    }

		});
		
	}

}

PurchaseAction.defaultProps = {
	didPurchase: function(id) {}
}
