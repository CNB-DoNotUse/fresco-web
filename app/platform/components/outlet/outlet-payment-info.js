/* global Stripe:true */

import React, { PropTypes } from 'react';
import utils from 'utils';

class OutletPaymentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        Stripe.setPublishableKey(window.__initialProps__.stripePublishableKey);
    }

    getActiveCard() {
        // returns active card or first card
        const { payment } = this.props;

        return payment.find((p) => (p.active === true))
        || payment.length ? payment[0] : null;
    }

	/**
	 * Save function for the card
    */
    save() {
        const exp_times = this.refs['payment-exp'].value.split('/');
        const params = {
            'number': this.refs['payment-ccn'].value,
            'cvv': this.refs['payment-cvv'].value,
            'exp-month': exp_times[0].trim(),
            'exp-year': (exp_times[1] || '').trim(),
            'address_zip': this.refs['payment-zip'].value,
            'name': this.refs['payment-name'].value,
            'currency': 'usd',
        };

        if (!Stripe.card.validateCardNumber(params.number)) return $.snackbar({content:'Invalid credit card number'});
        if (!Stripe.card.validateExpiry(params['exp-month'], params['exp-year'])) return $.snackbar({content:'Invalid expiration date'});
        if (!Stripe.card.validateCVC(params.cvv)) return $.snackbar({content:'Invalid CVV number'});

        const saveBtn = this.refs['outlet-card-save'];

        saveBtn.setAttribute('disabled', true);

        const form = $('<form></form>');
		for (let index in params) form.append('<input type="hidden" data-stripe="' + index + '" value="' + params[index] + '">');

        return Stripe.card.createToken(form, (status, response) => {
            if (response.error) {
                saveBtn.prop('disabled', false);
                return $.snackbar({ content: response.error.message });
            }

            $.ajax({
                url: '/scripts/outlet/payment/create',
                type: 'POST',
                data: { token: response.id },
                success(result, status, xhr) {
                    saveBtn.removeAttribute('disabled');

                    if (result.err) {
                        return this.error(null, null, result.err);
                    }

                    return $.snackbar({ content: 'Payment information updated!' });
                },
                error: (xhr, status, error) => {
                    $.snackbar({ content: utils.resolveError(error) });
                },
            });
        });
    }

    render() {
        let card = this.getActiveCard();
        let currentCardText = '';

        if (card) {
            if (card.brand && card.last4 != null) {
                card = `USING ${card.brand}-${card.last4}`;
                currentCardText = <span className="last4">{card}</span>;
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
                                ref="payment-ccn"
                            />
                            <input
                                type="text"
                                className="form-control name"
                                placeholder="Name on card"
                                tabIndex="4"
                                ref="payment-name"
                            />
                        </div>
                        <div className="right">
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
                                className="form-control zip"
                                placeholder="ZIP"
                                maxLength="5"
                                tabIndex="5"
                                ref="payment-zip"
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-flat outlet-card-save card-foot-btn"
                        ref="outlet-card-save"
                        tabIndex="6"
                        onClick={this.save}
                    >
                        SAVE CHANGES
                    </button>
                </div>
            </div>
        );
    }
}

OutletPaymentInfo.propTypes = {
    payment: PropTypes.array,
};

export default OutletPaymentInfo;
