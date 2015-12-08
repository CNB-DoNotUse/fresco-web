import React from 'react'

export default class AssignmentListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var assignment = this.props.assignment,
            location = assignment.location.googlemaps || 'Unknown',
            expirationTime;

        if (!assignment.expiration_time) {
            expirationTime = 'Never Expires';
        }
        else {
            
            var relative = formatTime(assignment.expiration_time);
           
            if (assignment.expiration_time < Date.now())
                expirationTime = "Expired " + relative;
            else
                expirationTime = "Expires " + relative;

        }
       
        
        var imageUrl = '/images/placeholder-assignment.png';

        // PAGE_Dispatch.getFirstPost(assignment, function(image){
        //     elem.find('.img-circle').attr("src", image);
        //     if(callback) callback(elem);
        // });

        return (

            <div
                id={assignment._id}
                className="list-item"
                onClick={this.props.setActiveAssignment.bind(null, assignment._id)}>
                <div>
                    <img className="img-circle" src={imageUrl} />
                </div>
                <div className="flexy">
                    <span className="md-type-body2">{assignment.title}</span>
                    <span className="md-type-caption md-type-black-secondary">{location + ' &bull; ' + expirationTime}</span>
                </div>
            </div>
        );
    }
}