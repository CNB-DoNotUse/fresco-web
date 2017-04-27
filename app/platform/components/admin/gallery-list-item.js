import React, { PropTypes } from 'react';
import FrescoImage from '../global/fresco-image';
import time from 'app/lib/time';
import 'sass/platform/_galleries';
import get from 'lodash/get';
import { postsHaveLocation } from 'app/lib/models';
import EditPosts from './../gallery/edit-posts';

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
    const locationWarning = (
        <span className="mdi mdi-alert-octagon icon"></span>
    );

    const postsLocation = postsHaveLocation(gallery.posts);

    let address = 'No Location';
    if (gallery.address) {
        address = gallery.address;
    } else if (postsLocation) {
        address = postsLocation;
    }

    //still experimenting with another layout
    // if (active) {
    //     return (
    //         <div onClick={onClick} className={`list-item ${active ? 'active' : ''}`} >
    //             <EditPosts
    //                 originalPosts={gallery.posts}
    //                 editingPosts={posts}
    //                 onToggleDeletePost={p => this.onToggleDeletePost(p)}
    //                 canDelete
    //                 refreshInterval
    //                 afterChange={this.onSliderChange.bind(this)}
    //             />
    //         </div>
    //     );
    // } else {
        return (
            <div onClick={onClick} className={`list-item ${active ? 'active' : ''}`} >
                <div>
                    <a href={`/gallery/${gallery.id}`} target="_blank">
                        <FrescoImage
                            className="img-circle"
                            style={{ width: '40px', height: '40px' }}
                            src={get(gallery, 'posts[0].image', '')}
                            size="thumb"
                            loadWithPlaceholder
                            refreshInterval
                        />
                    </a>
                    { !postsLocation && locationWarning }
                </div>

                <div className="list-item-assignment">
                    <p
                        className="md-type-body1 gallery-list-item--location"
                    >
                        {address}
                    </p>
                </div>
                <div className="list-item-timestamp">
                    <p className="md-type-body1">{time.formatTime(gallery.created_at, true, true)}</p>
                </div>
            </div>
        );
    // }
};

AdminGalleryListItem.propTypes = {
    gallery: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AdminGalleryListItem;
