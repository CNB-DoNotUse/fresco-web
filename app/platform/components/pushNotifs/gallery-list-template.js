import React, { PropTypes } from 'react';

const GalleryListTemplate = ({ title, body, restrictedLocations, restrictedUsers }) => (
    <div>
        Gallery List Template
    </div>
);

GalleryListTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    restrictedLocations: PropTypes.array,
    restrictedUsers: PropTypes.array,
};

export default GalleryListTemplate;

