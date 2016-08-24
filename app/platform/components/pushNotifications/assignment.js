import React, { PropTypes } from 'react';

const AssignmentTemplate = ({ title, body, restrictedLocations, restrictedUsers }) => (
    <div>
        Assignment Template
    </div>
);

AssignmentTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    restrictedLocations: PropTypes.array,
    restrictedUsers: PropTypes.array,
};

export default AssignmentTemplate;

