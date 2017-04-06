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
        const { user, post, page } = this.props;
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
                user={user}
                page={page}
            />
        );

        //If an admin
        if (user.roles.includes('admin') || user.roles.includes('download-temp')) {
            actions.push(downloadAction);
            if (!purchased) actions.push(purchaseAction);
        } else {
            // Check if the post is purchased
            if (user.outlet && !purchased) {
                actions.push(purchaseAction);
            } else if(purchased) {
                actions.push(downloadAction);
            }
        }

        if (post.stream) {
            let vr = false;

            if(post.width / post.height === 2) {
                vr = true;
            }

            postMedia = (
                <FrescoVideo
                    video={vr ? utils.streamToMp4(post.stream) : post.stream}
                    thumbnail={post.image}
                    status={post.status}
                    width="640"
                    vr={vr}
                    highRes
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
            <div className="col-xs-12 col-md-8 post-media-wrap">
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
    page: PropTypes.string.isRequired
};

export default PostDetailImage;
