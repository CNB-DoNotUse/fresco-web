import React from 'react'
import moment from 'moment'

export default class AssignmentListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var assignment = this.props.assignment,
            location = assignment.location.googlemaps || 'Unknown',
            expirationTime = new Date(this.props.assignment.expiration_time),
            expiredText = (moment().diff(expirationTime) > 1 ? 'Expired ' : 'Expires in') + moment(expirationTime).fromNow();
        
        var imageUrl = '/images/placeholder-assignment.png';

        // PAGE_Dispatch.getFirstPost(assignment, function(image){
        //     elem.find('.img-circle').attr("src", image);
        //     if(callback) callback(elem);
        // });

        return (
            <div
                id={assignment._id}
                className="list-item"
                onClick={this.props.setActiveAssignment.bind(null, assignment)}>
                <div>
                    <img className="img-circle" src={imageUrl} />
                </div>
                <div className="flexy">
                    <span className="md-type-body2">{assignment.title}</span>
                    <span className="md-type-caption md-type-black-secondary">{location + ' &bull; ' + expiredText}</span>
                </div>
            </div>
        );
    }
}