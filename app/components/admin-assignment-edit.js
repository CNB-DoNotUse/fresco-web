import React from 'react'
import EditMap from './editing/edit-map'

/**
    
    Assignment Edit Sidebar used in assignment administration page

**/

export default class AdminAssignmentEdit extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            activeAssignment: {},
            assignmentRadius: 0,
            mapLocation: null
        }

        this.handleRadiusChange = this.handleRadiusChange.bind(this);
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);

    }

    approve() {
        $.post('/scripts/assignment/approve',
        {
            id: this.state.activeAssignment._id,
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            radius: this.state.assignmentRadius,
            lat: this.state.mapLocation.lat,
            lng: this.state.mapLocation.lng,
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
            id: this.state.activeAssignment._id
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

    handleRadiusChange(e) {
        var feetRadius = parseFloat(this.refs['assignment-radius'].value);
        if(feetRadius == 'NaN') return;

        var milesRadius = feetRadius * 0.000189394;
        this.setState({
            assignmentRadius: milesRadius
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if(!this.props.assignment._id) return;

        if (this.props.assignment._id != prevProps.assignment._id) {

            $.material.init();

            this.setState({
                activeAssignment: this.props.assignment,
                assignmentRadius: this.props.assignment.location ? this.props.assignment.location.radius : 0,
                mapLocation: null
            });

            if(this.props.hasActiveGallery) {

                var location = new google.maps.places.Autocomplete(this.refs['assignment-location']);

                google.maps.event.addListener( location, 'place_changed', () => {
                    if(!location.getPlace().geometry) return;
                    var coord = location.getPlace().geometry.location;
                    this.setState({
                        mapLocation: {
                            lat: coord.lat(),
                            lng: coord.lng()
                        }
                    });
                });

                if(this.props.assignment.location) {
                    this.refs['assignment-location'].value = this.props.assignment.location.googlemaps;

                    this.refs['assignment-radius'].value = Math.round(milesToFeet(this.props.assignment.location.radius));
                    $(this.refs['assignment-radius']).removeClass('empty');

                    var loc = {
                        lat: this.props.assignment.location.geo.coordinates[1],
                        lng: this.props.assignment.location.geo.coordinates[0]
                    };

                    this.setState({
                        mapLocation: loc,
                        assignmentRadius: this.props.assignment.location.radius
                    });
                }


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
        var assignment = this.props.assignment;

        if(this.props.activeGalleryType != 'assignment') return (<div></div>);

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
                    <div style={{height: '309px'}}>
                        <div className="map-group">
                            <div className="form-group-default">
                                <input
                                    type="text"
                                    className="form-control floating-label google-autocomplete"
                                    ref="assignment-location"
                                    placeholder=" " />
                                <input
                                    type="text"
                                    className="form-control floating-label numbers"
                                    data-hint="feet"
                                    placeholder="Radius"
                                    onChange={this.handleRadiusChange}
                                    ref="assignment-radius" />
                            </div>
                            <EditMap location={this.state.mapLocation} radius={this.state.assignmentRadius ? milesToFeet(this.state.assignmentRadius) : null} />
                        </div>
                    </div>
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