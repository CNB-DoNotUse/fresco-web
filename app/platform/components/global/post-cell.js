import React, { PropTypes } from 'react';
import FrescoImage from './fresco-image';
import PostCellActions from './post-cell-actions';
import PostCellStories from './post-cell-stories';
import utils from 'utils';

/**
    * Single Post Cell, child of PostList
*/
class PostCell extends React.Component {

    constructor(props) {
        super(props);

        const purchased = props.post.purchased
            ? props.post.purchased !== 0
            : false;
        this.state = { purchased };
        this.postClicked = this.postClicked.bind(this);
    }

    postClicked(e) {
        // Check if clicked with shift key
        if (e.shiftKey) {
            this.props.togglePost(this.props.post);
        } else if (e.metaKey || e.ctrlKey) {
            window.open('/post/' + this.props.post.id);
        } else {
            window.open('/post/' + this.props.post.id, '_self');
        }
    }

    onPurchase() {
        this.setState({ purchased: true });
    }

    render() {
        const {
            post,
            toggled,
            sort,
            assignment,
            rank,
            editable,
            parentCaption,
            size,
            sizes,
        } = this.props;
        const { purchased } = this.state;

        let time = sort === 'captured_at' ? post.captured_at : post.created_at;
        let	timeString = typeof(time) === 'undefined' ? 'No timestamp' : utils.formatTime(time);
        let address = post.location && post.address ? post.address : 'No Address';
        const divSize = size === 'large' ? sizes.large : sizes.small;

        // Class name for post tile icon
        let statusClass = 'mdi icon pull-right ';
        statusClass += post.video == null ? 'mdi-image ' : 'mdi-movie ';
        statusClass += purchased ? 'available ' : 'md-type-black-disabled ';

        return (
            <div className={`${divSize} tile ${toggled ? 'toggled' : ''}`} >
                <div className="tile-body">
                    <div className="frame" />

                    <div className="hover" onClick={this.postClicked}>
                        <p className="md-type-body1">
                            {post.parent && post.parent.caption ? post.parent.caption : parentCaption}
                        </p>

                        <span className="md-type-caption">{post.byline}</span>

                        <PostCellStories stories={post.stories} />
                    </div>

                    <FrescoImage
                        image={post.image}
                        size={size}
                    />
                </div>

                <div className="tile-foot">
                    <PostCellActions
                        post={post}
                        assignment={assignment}
                        purchased={purchased}
                        onPurchase={(bool) => this.onPurchase(bool)}
                        rank={rank}
                        editable={editable}
                    />

                    <div>
                        <div className="tile-info">
                            <span className="md-type-body2">{address}</span>

                            <span className="md-type-caption timestring" data-timestamp={time}>{timeString}</span>
                        </div>

                        <span className={statusClass} />
                    </div>
                </div>
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
};

export default PostCell;

