import React from 'react'
import global from  '../../../lib/global'
/**
    
    Assignment List Item used in assignment administration page

**/

export default class AdminAssignmentListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var assignment = this.props.assignment;
        var location = 'No Location';

        if(assignment.location.address) {
            location = assignment.location.address;
        }

        if(assignment.location.googlemaps) {
            location = assignment.location.googlemaps;
        }

        return (
            <div className={"list-item" + (this.props.active ? ' active' : '')} onClick={this.props.setActiveAssignment.bind(null, assignment._id)}>
                <div>
                    <a href="" target="_blank">
                        <img
                            className="img-circle"
                            style={{width: '40px', height: '40px'}}
                            src="https://d1dw1p6sgigznj.cloudfront.net/images/user-1.png" />{ /* screen.css got rid of the image style */ }
                    </a>
                </div>
                <div className="flexy list-item-caption">
                    <p className="md-type-body1">
                        <a href={"/assignment/" + assignment._id} target="_blank">
                            {assignment.title}
                        </a>
                    </p>
                </div>
                <div>
                    <p className="md-type-body1 assignment-location" style={assignment.assignment ? {lineHeight: '18px'} : {}}>{location}</p>
                </div>
                <div>
                    <p className="md-type-body1">{global.formatTime(assignment.time_created)}</p>
                </div>
            </div>
        );
    }
}