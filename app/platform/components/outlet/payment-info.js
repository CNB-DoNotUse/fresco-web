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
            activePayment: props.payment.find(p => p.active) || props.payment[0],
            changes: [],
            disabled: true
        }
    }
    
    componentDidMount() {
        Stripe.setPublishableKey(window.__initialProps__.stripePublishableKey);
    }

    /**
     * Input change event for tracking changes in state
     * @param {String} value Value of the field
     * @param {String} source Unique source for tracking changes
     */
    onInputChange(value, source) {
        const { changes } = this.state
        const changed = value !== '';

        if(changed && !changes.includes(source)) {
            this.setState({
                disabled: false,
                changes: changes.concat(source)
            });
        } else if(!changed) {
            if(changes.length <= 1 && changes.includes(source)) {
                this.setState({ 
                    disabled: true, 
                    changes: []
                });
            } else {            
                this.setState({ 
                    changes: changes.filter(change => change !== source)
                });
            }        
        }
    }

	/**
	 * Save function for the card
     */
    save() {
        if(this.state.disabled) return;

        const {
            expiration,
            cvv,
            zip,
            name,
            number
        } = this.refs;
        const exp_times = expiration.value.split('/');
        const params = {
            number: number.value,
            cvv: cvv.value,
            exp_month: exp_times[0].trim(),
            exp_year: (exp_times[1] || '').trim(),
            address_zip: zip.value,
            name: name.value,
            currency: 'usd',
        };

        if (!Stripe.card.validateCardNumber(params.number)) {
            return $.snackbar({content:'Invalid credit card number!'});
        } else if (!Stripe.card.validateExpiry(params.exp_month, params.exp_year)) {
            return $.snackbar({content:'Invalid expiration date!'});
        } else if (!Stripe.card.validateCVC(params.cvv)) {
            return $.snackbar({content:'Invalid CVV number!'});
        }

        this.setState({ disabled: true });

        Stripe.card.createToken(params, (status, response) => {
            if (response.error) {
                this.setState({ disabled: false });
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
                //Clear input fields
                for (let ref in this.refs) {
                    if(this.refs[ref].value)
                        this.refs[ref].value = '';
                }

                this.setState({
                    payment: this.state.payment.concat(response),
                    activePayment: response,
                    disabled: true
                });

                return $.snackbar({ content: 'Payment information updated!' });
            })
            .fail((error) => {
                return $.snackbar({ content: 'There was an issue saving your payment info!' });
                
                this.setState({ disabled: false });
            });
        });
    }

    render() {
        const { activePayment, disabled } = this.state;
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
                            onKeyUp={(e) => this.onInputChange(e.target.value, 'number')}
                            maxLength="16"
                            tabIndex="1"
                            ref="number"
                        />

                        <input
                            type="text"
                            className="form-control date"
                            placeholder="00 / 00"
                            onKeyUp={(e) => this.onInputChange(e.target.value, 'date')}
                            maxLength="5"
                            tabIndex="2"
                            ref="expiration"
                        />
                        
                        <input
                            type="text"
                            className="form-control ccv"
                            placeholder="CVV"
                            onKeyUp={(e) => this.onInputChange(e.target.value, 'cvv')}
                            maxLength="4"
                            tabIndex="3"
                            ref="cvv"
                        />

                        <input
                            type="text"
                            className="form-control name"
                            placeholder="Name on card"
                            onKeyUp={(e) => this.onInputChange(e.target.value, 'name')}
                            tabIndex="4"
                            ref="name"
                        />

                        <input
                            type="text"
                            className="form-control zip"
                            onKeyUp={(e) => this.onInputChange(e.target.value, 'zip')}
                            placeholder="ZIP"
                            maxLength="5"
                            tabIndex="5"
                            ref="zip"
                        />
                    </div>

                    <button
                        className={`btn btn-save ${disabled ? 'disabled' : 'changed'}`}
                        ref="outlet-card-save"
                        tabIndex="6"
                        onClick={() => this.save()}
                    >SAVE CHANGES
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