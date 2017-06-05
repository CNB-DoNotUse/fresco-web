import React, { PropTypes } from 'react';
import utils from 'utils';
import time from 'app/lib/time';
import get from 'lodash/get';

/**
 * Assignment List Item used in assignment administration page
 */
class AdminAssignmentListItem extends React.Component {
    render() {
        const { assignment, active, setActiveAssignment } = this.props;
        let location = 'No Location';
        const outletId = get(assignment, 'outlets[0].id');

        if (assignment.address) {
            location = assignment.address;
        } else if (assignment.location && assignment.location.coordinates) {
            location = assignment.location.coordinates.join(', ');
        }

        const outlets = assignment.outlets.map((outlet) => outlet.title).join(", ");

        const defaultLocale = assignment.location && ( assignment.location.coordinates[0] === 0 && assignment.location.coordinates[1] === 0 )
        debugger
        return (
            <div
                className={`list-item assignment ${active ? 'active' : ''}`}
                onClick={setActiveAssignment}
            >
                <div>
                    <a
                        href={outletId ? `/outlet/${outletId}` : '#'}
                        target={outletId ? '_blank' : ''}
                    >
                        <img
                            className="img-circle"
                            style={{ width: '40px', height: '40px' }}
                            src={`${utils.CDN}/images/user-1.png`}
                            role="presentation"
                        />
                        {/* screen.css got rid of the image style */}
                    </a>
                </div>
                <div className="flexy list-item-caption">
                    <p className="md-type-body1">{outlets}</p>
                </div>
                <div className="flexy list-item-caption">
                    <p className="md-type-body1">
                        <a href={`/assignment/${assignment.id}`} target="_blank">
                            {assignment.title}
                        </a>
                    </p>
                </div>
                <div>
                    { defaultLocale &&
                        <i className="mdi mdi-alert-octagon icon"></i>}
                    <p
                        className="md-type-body1 assignment-location"
                        style={assignment.assignment ? { lineHeight: '18px' } : {}}
                    >
                        {location}
                    </p>
                </div>
                <div>
                    <p className="md-type-body1">{time.formatTime(assignment.created_at, true, true)}</p>
                </div>
            </div>
        );
    }
}

AdminAssignmentListItem.propTypes = {
    active: PropTypes.bool,
    assignment: PropTypes.object.isRequired,
    setActiveAssignment: PropTypes.func.isRequired,
};

export default AdminAssignmentListItem;
