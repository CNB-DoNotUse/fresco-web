/* global alertify:true */
import React, { PropTypes } from 'react';
import utils from 'utils';
import api from 'app/lib/api';
import { mergeReferral } from 'app/lib/referral';

/**
 * Global purchase action
 */
class PurchaseAction extends React.Component {
    requestPurchase(post, user, page) {
        const data = { post_id: post.id  };

        api
            .post('purchase/createasd', data)
            .then(() => {
                $.snackbar({
                    content: 'Purchase successful! Visit your outlet page or click to view your purchased content'
                }).click(() => {
                    window.location = '/outlet';
                });

                if (analytics) {
                    analytics.track('Post purchased', mergeReferral({
                        post_id: post.id,
                        owner_id: post.owner_id,
                        outlet_id: user ? user.outlet_id : null,
                        gallery_id: post.parent_id,
                        purchased_from: page
                    }))
                }

                this.props.onPurchase();
            })
            .catch(error => {
                console.log(error);
                $.snackbar({
                    content: error.msg || 'There was an error while completing your purchase!'
                });
            })
    }

    // Called whenever the purchase icon is selected
    purchase() {
		// Check if the prop exists first
        const { post, user, page } = this.props;
        if (!post) return;

		// Confirm the purchase
        alertify
        .confirm(`Are you sure you want to purchase? This will charge your account.
                 Content from members of your outlet may be purchased free of charge.`,
        (e) => {
            // Clicked 'Yes'
            if (e) {
                // Send request for purchase
                this.requestPurchase(post, user, page);
            }
        });
    }

    render() {
        return (
            <span
                className="mdi mdi-cash icon pull-right"
                onClick={() => this.purchase()}
            />
        )
    }
}

PurchaseAction.propTypes = {
    post: PropTypes.object,
    assignment: PropTypes.object,
    onPurchase: PropTypes.func.isRequired,
    page: PropTypes.string,
    user: PropTypes.object
};

export default PurchaseAction;
