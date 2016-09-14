import React, { PropTypes } from 'react';
import moment from 'moment';
import FrescoImage from '../global/fresco-image';
import FrescoVideo from '../global/fresco-video';

/**
 * Purchase list item inside an outlet column
 */
export default class OutletColumnPurchase extends React.Component {
    static propTypes = {
        purchase: PropTypes.object,
    }

    render() {
        const purchase = this.props.purchase;
        const post = purchase.post;
        const lastDay = Date.now() - 86400000;
        let assignmentMeta = '';
        let media = '';
        let timestampText = '';

        const name = post.owner
            ? post.owner.full_name
            : '';

        if (post.stream) {
            media = <FrescoVideo video={post.stream} thumbnail={post.image} />;
        } else {
            media = <FrescoImage src={post.image} size="small" />;
        }

        if (purchase.timestamp < lastDay) {
            timestampText = moment(purchase.timestamp).format('MMMM Do, YYYY');
        } else {
            timestampText = moment(purchase.timestamp).format('h:mm A') + ' UTC';
        }

        if (purchase.assignment) {
            assignmentMeta = (
                <div className="meta-assignment">
                    <a href={'/assignment/' + purchase.assignment.id}>
                        <span className="mdi mdi-logout-variant" />

                        <span className="title">{purchase.assignment.title}</span>
                    </a>
                </div>
            );
        }

        return (
            <li className="outlet-column__purchase">
                <div className="meta-top">
                    <a href={post.owner ? '/user/' + post.owner._id : '#'}>
                        <h3>{name}</h3>
                    </a>

                    <span>{timestampText}</span>
                </div>

                <div className="media-cell">
                    {media}
                </div>

                {assignmentMeta}
            </li>
        );
    }
}

