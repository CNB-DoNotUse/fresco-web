import React, { PropTypes } from 'react';
import FrescoImage from '../global/fresco-image';
import utils from 'utils';
import 'sass/platform/_galleries';
import get from 'lodash/get';

const AdminGalleryListItem = ({ gallery, active, onClick }) => {
    let galleryOwnerText;
    if (gallery.owner) {
        galleryOwnerText = (
            <p className="md-type-body2">
                <a href={`/user/${gallery.owner.id}`} target="_blank">
                    {
                        gallery.owner.full_name
                            ? gallery.owner.full_name
                            : gallery.owner.username
                    }
                </a>
            </p>
        );
    }

    let address = 'No Location';
    if (gallery.address) {
        address = gallery.address;
    } else if (gallery.posts[0]) {
        address = gallery.posts[0].address;
    }

    return (
        <div onClick={onClick} className={`list-item ${active ? 'active' : ''}`} >
            <div>
                <a href={`/gallery/${gallery.id}`} target="_blank">
                    <FrescoImage
                        imageClass="img-circle"
                        imageStyle={{ width: '40px', height: '40px' }}
                        image={get(gallery, 'posts[0].image', '')}
                        size="thumb"
                        role="presentation"
                        refreshInterval
                    />
                </a>
            </div>
            <div className="flexy list-item-caption">
                <p className="md-type-body1">{gallery.caption || 'No Caption'}</p>
            </div>
            <div className="list-item-owner">
                {galleryOwnerText}
            </div>
            <div className="list-item-assignment">
                {gallery.assignment
                    ? <p
                        className="md-type-body2 assignment-link"
                        style={{ lineHeight: '18px' }}
                    >
                        <a href={`/assignment/${gallery.assignment.id}`}>
                            {gallery.assignment.title}
                        </a>
                    </p>
                    : ''
                }
                <p
                    className="md-type-body1 gallery-list-item--location"
                    style={gallery.assignment ? { lineHeight: '18px' } : {}}
                >
                    {address}
                </p>
            </div>
            <div className="list-item-timestamp">
                <p className="md-type-body1">{utils.formatTime(gallery.created_at)}</p>
            </div>
        </div>
    );
};

AdminGalleryListItem.propTypes = {
    gallery: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AdminGalleryListItem;

