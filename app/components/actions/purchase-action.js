/* global alertify:true */
import React, { PropTypes } from 'react';
import global from '../../../lib/global';

/**
 * Global purchase actions
 */

class PurchaseAction extends React.Component {

    constructor(props) {
        super(props);
        this.purchase = this.purchase.bind(this);
    }

    requestPurchase(post, assignment) {
        const data = { post_ids: [post.id] };
        if (assignment && assignment.id) data.assignment_id = assignment.id;

        $.ajax({
            url: '/scripts/outlet/purchase',
            dataType: 'json',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: () => {
                $.snackbar({
                    content: 'Purchase successful! Visit your outlet page or click to view your purchased content'
                }).click(() => {
                    window.location = '/outlet';
                });

                return this.props.onPurchase();
            },
            error: (xhr, status, error) => {
                $.snackbar({
                    content: xhr.responseJSON.msg ||
                        global.resolveError(error, 'There was an error while completing your purchase!')
                });
            },
        });
    }

    // Called whenever the purchase icon is selected
    purchase() {
		// Check if the prop exists first
        const { post, assignment } = this.props;
        if (!post) return;

		// Confirm the purchase
        alertify
        .confirm(`Are you sure you want to purchase? This will charge your account.
                 Content from members of your outlet may be purchased free of charge.`,
        (e) => {
            // Clicked 'Yes'
            if (e) {
                // Send request for purchase
                this.requestPurchase(post, assignment);
            }
        });
    }

    render() {
        return (
            <span className="mdi mdi-cash icon pull-right" onClick={this.purchase} />
        );
    }
}

PurchaseAction.propTypes = {
    post: PropTypes.object,
    assignment: PropTypes.object,
    onPurchase: PropTypes.func.isRequired,
};

export default PurchaseAction;

