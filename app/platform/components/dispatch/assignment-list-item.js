import React, { PropTypes } from 'react';
import moment from 'moment';

class AssignmentListItem extends React.Component {
    render() {
        const { assignment, setActiveAssignment } = this.props;
        const location = assignment.address || 'Unknown';
        const expirationTime = new Date(assignment.ends_at);
        const expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ') + moment(expirationTime).fromNow();
        const imageUrl = '/images/placeholder-assignment.png';

        return (
            <div
                id={assignment.id}
                className="list-item assignment-list-item"
                onClick={() => setActiveAssignment(assignment)}
            >
                <div>
                    <img 
                        className="img-circle" 
                        src={imageUrl} 
                    />
                </div>
                
                <div className="flexy">
                    <span className="md-type-body2">{assignment.title}</span>
                    
                    <span className="md-type-caption md-type-black-secondary">
                        {`${location} • ${expiredText}`}
                    </span>
                </div>
            </div>
        );
    }
}

AssignmentListItem.propTypes = {
    assignment: PropTypes.object.isRequired,
    setActiveAssignment: PropTypes.func.isRequired,
};

export default AssignmentListItem;
