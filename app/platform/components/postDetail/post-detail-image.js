import React, { PropTypes } from 'react';
import PurchaseAction from '../actions/purchase-action.js';
import DownloadAction from '../actions/download-action.js';
import utils from 'utils';

/** //

Description : Image of the PostDetail page, contains image/video, byline and actions

// **/

/**
 * Post Detail Image parent object
 */
class PostDetailImage extends React.Component {
    constructor(props) {
        super(props);

        const purchased = props.post.purchased
            ? props.post.purchased !== 0
            : false;
        this.state = { purchased };
        this.contextMenu = this.contextMenu.bind(this);
    }

    onPurchase() {
        this.setState({ purchased: true });
    }

    /**
	 * Click event for either the image tag or the video tag
	 */
    contextMenu(e) {
        e.preventDefault();
    }

    render() {
        const { user, post } = this.props;
        const { purchased } = this.state;
        let actions = [];
        let postMedia = '';
        let i = 0;

        const assignment = window.location.search.split('assignment=')[1];
        const downloadAction = <DownloadAction post={post} key={i++} />;
        const purchaseAction = (
            <PurchaseAction
                post={post}
                assignment={assignment}
                onPurchase={(bool) => this.onPurchase(bool)}
                key={i++}
            />
        );

        if (user.rank < utils.RANKS.CONTENT_MANAGER) {
            if (user.outlet && purchased) {
                actions.push(downloadAction);
            } else if (user.outlet && post.license === 1) {
                // Check if the post is licensed
                actions.push(purchaseAction);
            }
        } else {
            actions.push(downloadAction);
            if (!purchased) actions.push(purchaseAction);
        }

        if (post.video) {
            postMedia = (
                <video width="100%" height="100%" controls onContextMenu={this.contextMenu}>
                    <source src={utils.formatVideo(post.video)} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            );
        } else {
            postMedia = (
                <img
                    role="presentation"
                    className="img-responsive"
                    onContextMenu={this.contextMenu}
                    src={utils.formatImg(post.image, 'large')}
                />
            );
        }

        return (
            <div className="col-xs-12 col-md-8">
                <div className="card panel">
                    <div className="card-foot small">
                        {actions}
                        <span className="md-type-body1">{post.byline}</span>
                    </div>
                    <div className="card-body">{postMedia}</div>
                </div>
            </div>

        );
    }
}

PostDetailImage.propTypes = {
    post: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
};

export default PostDetailImage;

