import global from '../../../lib/global'
import React from 'react'
import AssignmentEditMap from '../editing/assignment-edit-map'

/**
    
    Assignment Edit Sidebar used in assignment administration page

**/

export default class AdminAssignmentEdit extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            radius: null,
            location: null
        }
        this.updateLocation = this.updateLocation.bind(this);
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);
    }

    /**
     * Updates state location with passed params
     * @param  {dictionary} location Location Dictionary object {lat: x, lng: y}
     * @param  {integer} radius   Radius that has changed
     */
    updateLocation(passedLocation, passedRadius) {
        this.setState({
            location: passedLocation || null,
            radius: passedRadius || null
        })    
    }

    approve() {
        $.post('/scripts/assignment/approve',
        {
            id: this.props.assignment._id,
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            radius: this.state.radius,
            lat: this.state.location.lat,
            lng: this.state.location.lng,
            expiration_time: this.refs['assignment-expiration'].value * 1000 * 60 * 60
        }, (data) => {
            if(data.err) {
                $.snackbar({
                    content: 'Could not approve assignment!'
                });
            } else {
                $.snackbar({
                    content: 'Assignment Approved!'
                });
            }
        })

    }

    reject() {
        $.post('/scripts/assignment/deny', {
            id: this.props.assignment._id
        }, (data) => {
            if(data.err) {
                $.snackbar({
                    content: 'Could not reject assignment!'
                });
            } else {
                $.snackbar({
                    content: 'Assignment Rejected!'
                });
            }
        })
    }

    /**
     * New assignment is selected from the sidebar list, so componenet is updated
     */
    componentDidUpdate(prevProps, prevState) {

        if(!this.props.assignment._id) return;

        if (this.props.assignment._id != prevProps.assignment._id) {

            $.material.init();

            if(this.props.hasActiveGallery) {

                this.setState({
                    radius: this.props.assignment.location ? this.props.assignment.location.radius : 0,
                    location: {
                        lat: this.props.assignment.location.geo.coordinates[1],
                        lng: this.props.assignment.location.geo.coordinates[0],
                    }
                });

                var expirationDate = new Date(this.props.assignment.expiration_time);
                var expirationHours = Math.ceil((expirationDate - Date.now()) / 1000 / 60 / 60);

                this.refs['assignment-title'].value = this.props.assignment.title;
                this.refs['assignment-description'].value = this.props.assignment.caption;
                this.refs['assignment-expiration'].value = expirationHours;

                $(this.refs['assignment-title']).removeClass('empty');
                $(this.refs['assignment-description']).removeClass('empty');
                $(this.refs['assignment-expiration']).removeClass('empty');

            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
        // return this.props.assignment._id != nextProps.assignment._id;
    }

    render() {
        
        var location = this.state.location,
            radius = this.state.radius,
            address = this.props.assignment.location ? this.props.assignment.location.address : '';

        if(this.props.activeGalleryType != 'assignment') 
            return (<div></div>);

        return (
            <div className="dialog">
                <div className="dialog-body" style={{visibility: this.props.hasActiveGallery ? 'visible' : 'hidden'}}>
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Title"
                        ref="assignment-title" />
                    <textarea
                        type="text"
                        className="form-control floating-label"
                        placeholder="Description"
                        ref="assignment-description"></textarea>
                    <AssignmentEditMap 
                        location={location} 
                        radius={radius}
                        address={address}
                        updateLocation={this.updateLocation} />
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Expiration Time"
                        data-hint="hours from now"
                        ref="assignment-expiration"
                        style={{marginTop: '64px'}} /> {/*Styles need fixing*/}
                </div>
                <div className="dialog-foot">
                    <button type="button" className="btn btn-flat assignment-approve pull-right" onClick={this.approve}>Approve</button>
                    <button type="button" className="btn btn-flat assignment-deny pull-right" onClick={this.reject}>Reject</button>
                </div>
            </div>
        );
    }

}