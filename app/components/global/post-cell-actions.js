import React from 'react';
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
            edit,
            assignment,
            didPurchase,
        } = this.props;

        var actions = [],
            key = 0;

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
            if (purchased === false) {
                actions.push(
                    <PurchaseAction
                        post={post}
                        assignment={assignment ? assignment.id : null}
                        didPurchase={didPurchase}
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
        } else if (purchased === true) {
            // Check if the post has been purchased
            actions.push(
                <DownloadAction
                    post={post}
                    key={++key}
                />
            );

        } else if (purchased == false && post.license == 1) {
            // Check if the post is not purhcased, and it is purchasble from the license

            actions.push(
                <PurchaseAction
                    post={post}
                    assignment={assignment ? assignment.id : null}
                    didPurchase={didPurchase}
                    key={++key}
                />
            );
        }

        let link = '/post/' + post.id;

        if (assignment) {
            link += '?assignment=' + assignment.id;
        }

        return (
            <div className="hover">
                <a className="md-type-body2 post-link" href={link}>See more</a>
                {actions}
            </div>
        );
    }
}

export default PostCellActions;
