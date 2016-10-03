import React, { PropTypes } from 'react';
import PurchaseAction from '../actions/purchase-action.js';
import DownloadAction from '../actions/download-action.js';
import FrescoImage from '../global/fresco-image.js';
import FrescoVideo from '../global/fresco-video.js';
import utils from 'utils';

/**
 * Post Detail Image parent object
 * @description Image of the PostDetail page, contains image/video, byline and actions
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

        const assignmentId = window.location.search.split('assignment=')[1];
        const downloadAction = <DownloadAction post={post} key={i++} />;
        const purchaseAction = (
            <PurchaseAction
                post={post}
                assignment={{ id: assignmentId }}
                onPurchase={(bool) => this.onPurchase(bool)}
                key={i++}
            />
        );

        console.log(purchased);

        if (user.permissions.includes('get-all-purchases')) {
            actions.push(downloadAction);
            // Check if the post is purchased
            if (user.outlet && !purchased) {
                actions.push(purchaseAction);
            }
        } else {
            actions.push(downloadAction);
            if (!purchased) 
                actions.push(purchaseAction);
        }

        if (post.stream) {
            postMedia = (
                <FrescoVideo
                    video={post.stream}
                    thumbnail={post.image}
                    width='640'
                    autoplay
                    muted
                />
            );
        } else {
            postMedia = (
                <FrescoImage
                    refreshInterval
                    src={post.image}
                    class="img-responsive"
                    size="original"
                />
            );
        }

        return (
            <div className="col-xs-12 col-md-8">
                <div className="card panel">
                    <div className="card-foot small">
                        {actions}
                        <span className="md-type-body1">{utils.getBylineFromPost(post)}</span>
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
