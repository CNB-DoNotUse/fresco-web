import React, { PropTypes } from 'react';

const RecommendTemplate = ({ title, body, restrictedLocations, restrictedUsers }) => (
    <div>
        Recommend Template
    </div>
);

RecommendTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    restrictedLocations: PropTypes.array,
    restrictedUsers: PropTypes.array,
};

export default RecommendTemplate;
