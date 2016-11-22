import React, { PropTypes } from 'react';
import utils from 'utils';
import GalleryEdit from '../gallery/edit';
import FrescoImage from '../global/fresco-image';
import FrescoVideo from '../global/fresco-video';
import Actions from './cell-actions';
import Stories from './cell-stories';
import Time from './cell-time';

/**
 * Single Post Cell, child of PostList
 */
class PostCell extends React.Component {
    static propTypes = {
        permissions: PropTypes.array,
        parentCaption: PropTypes.string,
        size: PropTypes.string,
        sortBy: PropTypes.string,
        assignment: PropTypes.object,
        post: PropTypes.object,
        sizes: PropTypes.object,
        editable: PropTypes.bool,
        toggled: PropTypes.bool,
        togglePost: PropTypes.func,
        onMouseEnter: PropTypes.func,
    };

    static defaultProps = {
        sizes: {
            large: 'col-xs-12 col-sm-6 col-lg-4',
            small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2',
        },
        togglePost: () => {},
        toggled: false,
    };

    state = {
        purchased: !!this.props.post.purchased || false,
        galleryEditVisible: false,
        gallery: {},
    }

    onClickPost = (e) => {
        const { post, togglePost } = this.props;

        // Check if clicked with shift key
        if (e.shiftKey) {
            togglePost(post);
        } else if (e.metaKey || e.ctrlKey) {
            window.open(`/post/${post.id}`);
        } else {
            window.open(`/post/${post.id}`, '_self');
        }
    }

    onMouseEnter = () => {
        this.setState({ mouseEntered: true });
        this.props.onMouseEnter && this.props.onMouseEnter(this.props.post.id);
    }

    onMouseLeave = () => {
        this.setState({ mouseEntered: false });
    }

    onToggleGalleryEdit = (gallery = {}) => {
        if (gallery) {
            this.setState({ galleryEditVisible: !this.state.galleryEditVisible, gallery });
        } else {
            this.setState({ galleryEditVisible: !this.state.galleryEditVisible });
        }
    }

    renderFooter() {
        const {
            post,
            assignment,
            permissions,
            sortBy,
            editable,
        } = this.props;
        const { purchased } = this.state;

        // Class name for post tile icon
        let statusClass = 'mdi icon pull-right ';
        statusClass += post.stream == null ? 'mdi-image ' : 'mdi-movie ';
        statusClass += purchased ? 'available ' : 'md-type-black-disabled ';

        return (
            <div className="tile-foot noselect" >
                <Actions
                    post={post}
                    assignment={assignment}
                    purchased={purchased}
                    onPurchase={() => this.setState({ purchased: true })}
                    onEdit={this.onToggleGalleryEdit}
                    permissions={permissions}
                    editable={editable}
                />

                <div>
                    <div className="tile-info">
                        <span className="md-type-body2">{post.address || 'No Address'}</span>

                        <Time sortBy={sortBy} post={post} />
                    </div>

                    <span className={statusClass} />
                </div>
            </div>
        );
    }

    render() {
        const {
            post,
            toggled,
            parentCaption,
            size,
            sizes,
        } = this.props;
        const { galleryEditVisible, gallery, mouseEntered } = this.state;
        const divSize = size === 'large' ? sizes.large : sizes.small;

        return (
            <div className={`${divSize} tile ${toggled ? 'toggled' : ''}`}>
                <div className="tile-body noselect">
                    <div className="frame" />

                    <div
                        className="hover"
                        onClick={this.onClickPost}
                        onMouseEnter={this.onMouseEnter}
                        onMouseLeave={this.onMouseLeave}
                    >
                        <p className="md-type-body1">
                            {post.parent && post.parent.caption
                                ? post.parent.caption
                                : parentCaption
                            }
                        </p>

                        <span className="md-type-caption">
                            {utils.getBylineFromPost(post)}
                        </span>

                        <Stories stories={post.stories} />
                    </div>

                    {(mouseEntered && post.stream) ? (
                        <FrescoVideo
                            video={post.stream}
                            hideControls
                            autoplay
                        />
                    ) : (
                        <div className="img">
                            <FrescoImage
                                src={post.image}
                                size={size}
                                refreshInterval
                            />
                        </div>
                    )}
                </div>

                {this.renderFooter()}

                {(gallery && galleryEditVisible) && (
                    <GalleryEdit
                        gallery={gallery}
                        visible={galleryEditVisible}
                        toggle={this.onToggleGalleryEdit}
                    />
                )}
            </div>
        );
    }
}

export default PostCell;

