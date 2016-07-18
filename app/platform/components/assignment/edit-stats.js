import React, { PropTypes } from 'react';
import moment from 'moment';

class EditStats extends React.Component {
    render() {
        const { assignment, outlet } = this.props;
        const address = assignment.address || 'No Address';
        const timeCreated = moment(new Date(assignment.created_at)).format('MMM Do YYYY, h:mm:ss a');
        const expirationTime = new Date(this.props.assignment.expiration_time);
        const expiresText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires ')
            + moment(expirationTime).fromNow();

        return (
            <div className="col-lg-3 visible-lg edit-current">
                <div className="meta">
                    <div className="meta-user">
                        <div>
                            <img className="img-circle img-responsive" src="/images/placeholder-assignment@2x.png" />
                        </div>
                        <div>
                            <span className="md-type-title">{assignment.title}</span>
                            <span id="assignment-edit-owner" className="md-type-body1">
                                Posted by {outlet.title}
                            </span>
                        </div>
                    </div>
                    <div className="meta-description">{assignment.caption}</div>
                    <div className="meta-list">
                        <ul className="md-type-subhead">
                            <li>
                                <span className="mdi mdi-clock icon"></span>{timeCreated}
                            </li>
                            <li>
                                <span className="mdi mdi-map-marker icon"></span>{address}
                            </li>
                            <li>
                                <span className="mdi mdi-alert-circle icon"></span>{expiresText}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

EditStats.propTypes = {
    assignment: PropTypes.object,
    stats: PropTypes.object,
    outlet: PropTypes.object,
};

export default EditStats;

