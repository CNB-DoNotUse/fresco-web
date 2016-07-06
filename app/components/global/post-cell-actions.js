import React, { PropTypes } from 'react';
import PostEditAction from './../actions/post-edit-action.js';
import DownloadAction from './../actions/download-action.js';
import PurchaseAction from './../actions/purchase-action.js';
import global from '../../../lib/global';

/**
 * Post Cell Actions
 * Description : Set of icons on the the post cell's hover
 */
class PostCellActions extends React.Component {
    render() {
        const {
            rank,
            purchased,
            editable,
            post,
            assignment,
            onPurchase,
        } = this.props;

        let actions = [];
        let key = 0;

        // Check if we're CM or greater
        if (typeof(rank) !== 'undefined' && rank >= global.RANKS.CONTENT_MANAGER) {
            if (editable) {
                actions.push(
                    <PostEditAction
                        post={post}
                        edit={post}
                        key={++key}
                    />
                );
            }

            // Show the purhcased icon if the post hasn't been purchased
            if (!purchased) {
                actions.push(
                    <PurchaseAction
                        post={post}
                        assignment={assignment ? assignment.id : null}
                        onPurchase={onPurchase}
                        key={++key}
                    />
                );
            }

            actions.push(
                <DownloadAction
                    post={post}
                    key={++key}
                />
            );
        } else if (purchased) {
            // Check if the post has been purchased
            actions.push(
                <DownloadAction
                    post={post}
                    key={++key}
                />
            );
        } else if (!purchased && post.license === 1) {
            // Check if the post is not purhcased, and it is purchasble from the license
            actions.push(
                <PurchaseAction
                    post={post}
                    assignment={assignment ? assignment.id : null}
                    onPurchase={onPurchase}
                    key={++key}
                />
            );
        }

        let link = '/post/' + post.id;
        if (assignment) link += '?assignment=' + assignment.id;

        return (
            <div className="hover">
                <a className="md-type-body2 post-link" href={link}>See more</a>
                {actions}
            </div>
        );
    }
}

PostCellActions.propTypes = {
    rank: PropTypes.number,
    editable: PropTypes.bool,
    purchased: PropTypes.bool.isRequired,
    post: PropTypes.object,
    assignment: PropTypes.object,
    onPurchase: PropTypes.func.isRequired,
};

export default PostCellActions;

