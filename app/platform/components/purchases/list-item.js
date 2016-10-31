import React, { PropTypes } from 'react';
import moment from 'moment';
import utils from 'utils';

export default class PurchasesListItem extends React.Component {
	/**
	 * Opens passed link
	 */
    openLink(link) {
        window.open(link, '_blank');
    }

    render() {
        const { purchase, showTitle } = this.props;
        const { assignment, post, outlet, amount } = purchase;
        const video = post.stream != null;
        const timeString = moment(purchase.created_at).format('MMM Do, h:mma');
        const price = `$${(amount / 100).toFixed(2)}`; // amount to 2 decimal points

        return (
            <span
                style={{ cursor: 'pointer' }}
                onClick={() => this.openLink(`/post/${post.id}`)}
            >
                <div className="list-item">
                    <div>
                        <img
                            className="img-circle"
                            src={post ? utils.formatImg(post.image, 'small') : ''}
                            style={{
                                margin: '-2px 0',
                                width: '40px',
                                height: '40px'
                            }}
                        />
                    </div>
                    <div>
                        <p className="md-type-body1">{timeString}</p>
                    </div>
                    <div>
                        <p className="md-type-body1">{video ? 'Video' : 'Photo'}</p>
                    </div>
                    <div className={post.owner ? '' : 'flexy'}>
                        <p className="md-type-body1">{price}</p>
                    </div>
                    {post.owner && (
                        <div className="flexy" >
                            <a href={`/user/${post.owner.id}`}>
                                <p className="md-type-body2">
                                    {post.owner.full_name || post.owner.username}
                                </p>
                            </a>
                        </div>
                    )}

                    {assignment && (
                        <div onClick={() => this.openLink('/assignment/' + assignment.id)}>
                            <p className="md-type-body2" style={{ lineHeight: '16px' }}>
                                {assignment.title}
                            </p>

                            <p className="md-type-body1" style={{ lineHeight: '24px' }}>
                                {assignment.location.address || assignment.location.googlemaps}
                            </p>
                        </div>
                    )}

                    {showTitle && (
                        <div>
                            <a href={`/outlet/${outlet.id}`}>
                                <p className="md-type-body2 toggle-aradd  toggler">
                                    {showTitle ? outlet.title : ''}
                                </p>
                            </a>
                        </div>
                    )}
                </div>
            </span>
		);
    }
}

PurchasesListItem.propTypes = {
    purchase: PropTypes.object.isRequired,
    showTitle: PropTypes.bool,
};

PurchasesListItem.defaultProps = {
    showTitle: true,
};
