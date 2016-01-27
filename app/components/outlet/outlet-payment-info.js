import React from 'react'

export default class OutletPaymentInfo extends React.Component {

	constructor(props) {
		super(props);
		this.save = this.save.bind(this);
	}

	componentDidMount() {
		Stripe.setPublishableKey(window.__initialProps__.stripePublishableKey);
	}

	/**
	 * Save funciton for the card
	 */
	save() {
		var exp_times = this.refs['payment-exp'].value.split('/'),
			self = this,
			params = {
				"number": this.refs['payment-ccn'].value,
				"cvv": this.refs['payment-cvv'].value,
				"exp-month": exp_times[0].trim(),
				"exp-year": (exp_times[1] || '').trim(),
				"address_zip": this.refs['payment-zip'].value,
				"name": this.refs['payment-name'].value,
				"currency": "usd"
			};

		if (!Stripe.card.validateCardNumber(params.number))
			return $.snackbar({content:'Invalid credit card number'});
		if (!Stripe.card.validateExpiry(params['exp-month'], params['exp-year']))
			return $.snackbar({content:'Invalid expiration date'});
		if (!Stripe.card.validateCVC(params.cvv))
			return $.snackbar({content:'Invalid CVV number'});

		var saveBtn = this.refs['outlet-card-save'];

		saveBtn.setAttribute('disabled', true);

		var stripeResponseHandler = (status, response)  => {
			if (response.error){
				saveBtn.prop('disabled', false);
				return $.snackbar({content: response.error.message});
			}

			$.ajax({
				url: "/scripts/outlet/update",
				type: 'POST',
				data: {
					stripe_token: response.id
				},
				success: (result, status, xhr) => {
					if (result.err)
						return self.error(null, null, result.err);

					window.location.reload();
				},
				error: (xhr, status, error) => {
					$.snackbar({content:resolveError(error)});
				}

			});
		};
		
		var form = $('<form></form>');

		for (var index in params)
			form.append('<input type="hidden" data-stripe="' + index + '" value="' + params[index] + '">');

		Stripe.card.createToken(form, stripeResponseHandler);
	}

	render() {

		var card = this.props.outlet.card;

		var currentCardText = '';

		if(card) {
			if(card.brand && card.last4 != null) { 
				card = 'USING ' + card.brand + ' - ' + card.last4;
				currentCardText = <span className="last4">{card}</span>
			}	
		}

		return (
			<div className="card settings-outlet-payment">
				<div className="header">
					<span className="title">PAYMENT INFORMATION</span>
					<div>
						{currentCardText}
						<a href="/outlet">PURCHASE HISTORY</a>
					</div>
				</div>
				
				<div className="card-form">
					<div className="inputs">
						<div className="left">
							<input 
								type="text"
								className="form-control" 
								placeholder="Card number"
								maxLength="16" 
							 	tabIndex="1" 
								ref="payment-ccn" />
							<input 
								type="text"
								className="form-control name" 
								placeholder="Name on card" 
								tabIndex="4" 
								ref="payment-name" />
						</div>
						<div className="right">
							<input 
								type="text"
								className="form-control date" 
								placeholder="00 / 00" 
								maxLength="5" 
								tabIndex="2" 
								ref="payment-exp" />
							<input 
								type="text"
								className="form-control ccv" 
								placeholder="CVV" 
								maxLength="4" 
								tabIndex="3" 
								ref="payment-cvv" />
							<input 
								type="text"
								className="form-control zip" 
								placeholder="ZIP" 
								maxLength="5" 
								tabIndex="5" 
								ref="payment-zip" />
						</div>
					</div>

					<button 
						className="btn btn-flat outlet-card-save" 
						ref="outlet-card-save" 
						tabIndex="6" 
						onClick={this.save}>SAVE CHANGES</button>
				</div>
			</div>
		);
	}
}