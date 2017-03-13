import React, { PropTypes } from 'react';
import DownloadAction from './../actions/download-action.js';
import PurchaseAction from './../actions/purchase-action.js';

/**
 * Post Cell Actions
 * Description : Set of icons on the the post cell's hover
 */
class PostCellActions extends React.Component {
    /**
     * Called when PostCellAction's Edit button is clicked
     * @param  {Object} post - Has post
     */
    onClickEdit() {
        const id = this.props.post.parent_id;
        $.ajax({ url: `/api/gallery/${id}` })
        .then((res) => {
            this.props.onEdit(res);
        }, (err) => {
            if (err) {
                $.snackbar({ content: 'We couldn\'t find the gallery attached to this post!' });
                return;
            }
        });
    }

    render() {
        const {
            roles,
            purchased,
            editable,
            post,
            assignment,
            onPurchase,
            page,
            user
        } = this.props;

        const actions = [];
        let key = 0;

        // Check if we're CM or greater
        if (roles.includes('admin')) {
            if (editable) {
                actions.push(
                    <span
                        key={++key}
                        className="mdi mdi-pencil icon pull-right"
                        onClick={() => this.onClickEdit()}
                    />
                );
            }

            // Show the purhcased icon if the post hasn't been purchased
            if (!purchased) {
                actions.push(
                    <PurchaseAction
                        post={post}
                        assignment={assignment}
                        onPurchase={onPurchase}
                        key={++key}
                        page={page}
                        user={user}
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
        } else if (!purchased) {
            // Check if the post is not purhcased, and it is purchasble from the license
            actions.push(
                <PurchaseAction
                    post={post}
                    assignment={assignment}
                    onPurchase={onPurchase}
                    key={++key}
                    page={page}
                    user={user}
                />
            );
        }

        let link = `/post/${post.id}`;
        if (assignment) link += `?assignment=${assignment.id}`;

        return (
            <div className="hover">
                <a className="md-type-body2 post-link" href={link}>See more</a>

                {actions}
            </div>
        );
    }
}

PostCellActions.propTypes = {
    roles: PropTypes.array,
    editable: PropTypes.bool,
    purchased: PropTypes.bool.isRequired,
    post: PropTypes.object,
    assignment: PropTypes.object,
    onPurchase: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    page: PropTypes.string,
    user: PropTypes.object
};

export default PostCellActions;
