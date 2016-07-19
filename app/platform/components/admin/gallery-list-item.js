import React, { PropTypes } from 'react';
import utils from 'utils';

class AdminGalleryListItem extends React.Component {
    render() {
        const { gallery, active, onClick } = this.props;

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

        let location = 'No Location';
        if (gallery.address) {
            location = gallery.address;
        } else if (gallery.location && gallery.location.coordinates) {
            location = gallery.location.coordinates.join(', ');
        }

        let assignmentLink = <div />;
        if (gallery.assignment) {
            assignmentLink = (
                <p
                    className="md-type-body2 assignment-link"
                    style={{ lineHeight: '18px' }}
                >
                    <a href={`/assignment/${gallery.assignment.id}`}>
                        {gallery.assignment.title}
                    </a>
                </p>
            );
        }

        const imgUrl = gallery.posts && gallery.posts.length
            ? utils.formatImg(gallery.posts[0].image, 'thumb')
            : '';


        return (
            <div onClick={onClick} className={`list-item ${active ? 'active' : ''}`} >
                <div>
                    <a href={`/gallery/${gallery.id}`} target="_blank">
                        <img
                            className="img-circle"
                            style={{ width: '40px', height: '40px' }}
                            src={imgUrl}
                            role="presentation"
                        />
                        {/* screen.css got rid of the image style */}
                    </a>
                </div>
                <div className="flexy list-item-caption">
                    <p className="md-type-body1">{gallery.caption || 'No Caption'}</p>
                </div>
                <div className="list-item-owner">
                    {galleryOwnerText}
                </div>
                <div className="list-item-assignment">
                    {assignmentLink}
                    <p
                        className="md-type-body1 assignment-location"
                        style={gallery.assignment ? { lineHeight: '18px' } : {}}
                    >
                        {location}
                    </p>
                </div>
                <div className="list-item-timestamp">
                    <p className="md-type-body1">{utils.formatTime(gallery.created_at)}</p>
                </div>
            </div>
        );
    }
}

AdminGalleryListItem.propTypes = {
    gallery: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AdminGalleryListItem;

