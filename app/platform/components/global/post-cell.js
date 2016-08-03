import React, { PropTypes } from 'react';
import FrescoImage from './fresco-image';
import PostCellActions from './post-cell-actions';
import PostCellStories from './post-cell-stories';
import utils from 'utils';
import moment from 'moment';

/**
 * Single Post Cell, child of PostList
 */
class PostCell extends React.Component {
    constructor(props) {
        super(props);

        const { post } = props;
        const purchased = post.purchased
            ? post.purchased !== 0
            : false;
        const firstLook = moment().diff(post.first_look_until) > 1
            ? null
            // ? moment().add(20, 'minutes')
            : moment(post.first_look_until);

        this.state = {
            purchased,
            firstLook,
        };
    }

    componentDidMount() {
        const { firstLook } = this.state;
        if (firstLook) {
            setInterval(() => {
                this.setState({ firstLook: firstLook.subtract({ seconds: 1 }) });
            }, 1000);
        }
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

    renderFirstLook() {
        const { firstLook } = this.state;
        if (!firstLook || moment().diff(firstLook) > 1) {
            return '';
        }
        const remainingTime = moment(firstLook.diff(moment())).format('mm:ss');

        return (
            <span className="tile--first-look">
                <i className="mdi mdi-clock-fast" />
                <span>{`${remainingTime} remaining`}</span>
            </span>
        );
    }

    renderActions() {
        const {
            post,
            sort,
            assignment,
            rank,
            editable,
        } = this.props;
        const { purchased, firstLook } = this.state;
        let time = sort === 'captured_at' ? post.captured_at : post.created_at;
        let	timeString = typeof(time) === 'undefined' ? 'No timestamp' : utils.formatTime(time);
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

                        {firstLook
                            ? this.renderFirstLook()
                            : <span className="md-type-caption timestring" data-timestamp={time}>
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

                    <div className="hover" onClick={(e) => this.postClicked(e)}>
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
};

export default PostCell;

