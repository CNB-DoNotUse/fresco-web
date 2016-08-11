import React, { PropTypes } from 'react';
import utils from 'utils';

/**
 * Payment Info component in Outlet Settings
 */
class PaymentInfo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            payment: props.payment,
            activePayment: props.payment.find(p => p.active) || props.payment[0]
        }
    }
    
    componentDidMount() {
        Stripe.setPublishableKey(window.__initialProps__.stripePublishableKey);
    }

	/**
	 * Save function for the card
     */
    save() {
        const exp_times = this.refs['payment-exp'].value.split('/');
        const params = {
            number: this.refs['payment-ccn'].value,
            cvv: this.refs['payment-cvv'].value,
            exp_month: exp_times[0].trim(),
            exp_year: (exp_times[1] || '').trim(),
            address_zip: this.refs['payment-zip'].value,
            name: this.refs['payment-name'].value,
            currency: 'usd',
        };

        if (!Stripe.card.validateCardNumber(params.number)) {
            return $.snackbar({content:'Invalid credit card number!'});
        } else if (!Stripe.card.validateExpiry(params.exp_month, params.exp_year)) {
            return $.snackbar({content:'Invalid expiration date!'});
        } else if (!Stripe.card.validateCVC(params.cvv)) {
            return $.snackbar({content:'Invalid CVV number!'});
        }

        const saveBtn = this.refs['outlet-card-save'];
        saveBtn.setAttribute('disabled', true);

        Stripe.card.createToken(params, (status, response) => {
            if (response.error) {
                saveBtn.removeAttribute('disabled')
                return $.snackbar({ content: response.error.message });
            }

            $.ajax({
                url: "/api/outlet/payment/create",
                method: 'post',
                data: JSON.stringify({
                    active: true,
                    token: response.id
                }),
                contentType: 'application/json',
                dataType: 'json'
            })
            .done((response) => {
                this.setState({
                    payment: this.state.payment.concat(response),
                    activePayment: response
                });

                //Clear input fields
                for (let ref in this.refs) {
                    if(this.refs[ref].value)
                        this.refs[ref].value = '';
                }


                return $.snackbar({ content: 'Payment information updated!' });
            })
            .fail((error) => {
                return $.snackbar({ content: utils.resolveError(error) });
            })
            .always(() => {
                saveBtn.removeAttribute('disabled');
            })
        });
    }

    render() {
        const { activePayment } = this.state;
        let cardText = '';

        if (activePayment && activePayment.brand && activePayment.last4 != null) {
            cardText = `USING ${activePayment.brand}-${activePayment.last4}`;
        } else {
            cardText = 'No active payment method!'
        }

        return (
            <div className="card settings-outlet-payment">
                <div className="header">
                    <span className="title">PAYMENT INFORMATION</span>

                    <div>
                        <span className="last4">{cardText}</span>

                        <a href="/outlet">PURCHASE HISTORY</a>
                    </div>
                </div>

                <div className="card-form">
                    <div className="inputs">
                        <input
                            type="text"
                            className="form-control card"
                            placeholder="Card number"
                            maxLength="16"
                            tabIndex="1"
                            ref="payment-ccn"
                        />
                        <input
                            type="text"
                            className="form-control date"
                            placeholder="00 / 00"
                            maxLength="5"
                            tabIndex="2"
                            ref="payment-exp"
                        />
                        
                        <input
                            type="text"
                            className="form-control ccv"
                            placeholder="CVV"
                            maxLength="4"
                            tabIndex="3"
                            ref="payment-cvv"
                        />

                        <input
                            type="text"
                            className="form-control name"
                            placeholder="Name on card"
                            tabIndex="4"
                            ref="payment-name"
                        />

                        <input
                            type="text"
                            className="form-control zip"
                            placeholder="ZIP"
                            maxLength="5"
                            tabIndex="5"
                            ref="payment-zip"
                        />

                    </div>

                    <button
                        className="btn btn-flat outlet-card-save card-foot-btn"
                        ref="outlet-card-save"
                        tabIndex="6"
                        onClick={() => this.save()}
                    >
                        SAVE CHANGES
                    </button>
                </div>
            </div>
        );
    }
}

PaymentInfo.defaultProps = {
    payment: []
}

PaymentInfo.propTypes = {
    payment: PropTypes.array,
};

export default PaymentInfo;