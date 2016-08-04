import React, { PropTypes } from 'react';
import FrescoImage from './fresco-image';
import Actions from './actions';
import Stories from './stories';
import FirstLook from './firstLook';
import utils from 'utils';
import moment from 'moment';

/**
 * Single Post Cell, child of PostList
 */
class PostCell extends React.Component {
    constructor(props) {
        super(props);

        const { post } = props;

        this.state = { 
            purchased: post.purchased
        }
    }

    onClickPost(e) {
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

    renderActions() {
        const {
            post,
            sort,
            assignment,
            rank,
            editable,
        } = this.props;
        
        const { purchased } = this.state;

        let time = sort === 'captured_at' ? post.captured_at : post.created_at;
        let timeString = typeof(time) === 'undefined' ? 'No timestamp' : utils.formatTime(time);
        let address = post.location && post.address ? post.address : 'No Address';
        
        // Class name for post tile icon
        let statusClass = 'mdi icon pull-right ';
        statusClass += post.video == null ? 'mdi-image ' : 'mdi-movie ';
        statusClass += purchased ? 'available ' : 'md-type-black-disabled ';


        return (
            <div className="tile-foot" >

                <PostCellActions
                    post={post}
                    assignment={assignment}
                    purchased={purchased}
                    onPurchase={() => this.setState({ purchased: true })}
                    rank={rank}
                    editable={editable}
                />

                <div>
                    <div className="tile-info">
                        <span className="md-type-body2">{address}</span>

                        {post.first_look_until ? 
                            <FirstLook post={post} />
                            : 
                            <span className="md-type-caption timestring" data-timestamp={time}>
                                {timeString}
                            </span>
                        }
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
        const divSize = size === 'large' ? sizes.large : sizes.small;

        return (
            <div
                className={`${divSize} tile ${toggled ? 'toggled' : ''}`}
            >
                <div className="tile-body">
                    <div className="frame" />

                    <div className="hover" onClick={(e) => this.onClickPost(e)}>
                        <p className="md-type-body1">
                            {post.parent && post.parent.caption
                                ? post.parent.caption
                                : parentCaption
                            }
                        </p>

                        <span className="md-type-caption">{post.byline}</span>

                        <PostCellStories stories={post.stories} />
                    </div>

                    <FrescoImage
                        image={post.image}
                        size={size}
                    />
                </div>
                {this.renderActions()}

            </div>
        );
    }
}

PostCell.defaultProps = {
    sizes: {
        large: 'col-xs-12 col-sm-6 col-lg-4',
        small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2',
    },
    togglePost: () => {},
    toggled: false,
};

PostCell.propTypes = {
    rank: PropTypes.number,
    parentCaption: PropTypes.string,
    size: PropTypes.string,
    sort: PropTypes.string,
    assignment: PropTypes.object,
    post: PropTypes.object,
    sizes: PropTypes.object,
    editable: PropTypes.bool,
    toggled: PropTypes.bool,
    togglePost: PropTypes.func,
};

export default PostCell;