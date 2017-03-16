/* global alertify:true */
import React, { PropTypes } from 'react';
import utils from 'utils';
import { mergeReferral } from 'app/lib/referral';

/**
 * Global purchase action
 */
class PurchaseAction extends React.Component {
    requestPurchase(post, assignment, user, page) {
        const data = { post_ids: [post.id] };
        if (assignment && assignment.id) data.assignment_id = assignment.id;

        $.ajax({
            url: '/api/outlet/purchase',
            dataType: 'json',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
        })
        .done(() => {
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
        .fail((xhr, status, error) => {
            $.snackbar({
                content: xhr.responseJSON.msg || 'There was an error while completing your purchase!'
            });
        });
    }

    // Called whenever the purchase icon is selected
    purchase() {
		// Check if the prop exists first
        const { post, assignment, user, page } = this.props;
        if (!post) return;

		// Confirm the purchase
        alertify
        .confirm(`Are you sure you want to purchase? This will charge your account.
                 Content from members of your outlet may be purchased free of charge.`,
        (e) => {
            // Clicked 'Yes'
            if (e) {
                // Send request for purchase
                this.requestPurchase(post, assignment, user, page);
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
