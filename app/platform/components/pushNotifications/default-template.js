import React, { PropTypes } from 'react';

const DefaultTemplate = ({ title, body, restrictedLocations, restrictedUsers }) => (
    <div>
        Default Template
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    restrictedLocations: PropTypes.array,
    restrictedUsers: PropTypes.array,
};

export default DefaultTemplate;

