import global from '../../../lib/global'
import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'

/**

    Assignment Edit Sidebar used in assignment administration page

**/

export default class AdminAssignmentEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            address: null,
            radius: null,
            location: null
        }
        this.pending = false;
        this.onPlaceChange = this.onPlaceChange.bind(this);
        this.onRadiusUpdate = this.onRadiusUpdate.bind(this);
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);
    }

    componentDidMount() {
        $.material.init();

        this.setState({
            radius: this.props.assignment.location ? this.props.assignment.location.radius : 0,
            location: {
                lat: this.props.assignment.location.geo.coordinates[1],
                lng: this.props.assignment.location.geo.coordinates[0],
            }
        });
    }

    /**
     * New assignment is selected from the sidebar list, so componenet is updated
     */
    componentDidUpdate(prevProps, prevState) {
        $.material.init();

        if(!this.props.assignment._id) return;

        if (this.props.assignment._id != prevProps.assignment._id) {
            if(this.props.hasActiveGallery) {

                var assignment = this.props.assignment;

                this.setState({
                    address: null,
                    radius: assignment.location ? this.props.assignment.location.radius : 0,
                    location: {
                        lat: assignment.location.geo.coordinates[1],
                        lng: assignment.location.geo.coordinates[0],
                    }
                });

                this.refs['assignment-title'].value = assignment.title;
                this.refs['assignment-description'].value = assignment.caption;
                this.refs['assignment-expiration'].value = assignment ? global.hoursToExpiration(assignment.expiration_time) : null;

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

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        this.setState({
            address: place.address,
            location: place.location
        });
    }

    /**
     * Called when AutocompleteMap's radius changes.
     * @param  {int} radius Radius in feet
     */
    onRadiusUpdate(radius) {
        this.setState({
            radius: global.feetToMiles(radius)
        });
    }

    approve() {
        this.pending = true;

        $.post('/api/assignment/approve',
        {
            id: this.props.assignment._id,
            now: Date.now(),
            title: this.refs['assignment-title'].value,
            caption: this.refs['assignment-description'].value,
            address: this.state.address || undefined,
            googlemaps: this.state.address || undefined,
            radius: this.state.radius,
            lat: this.state.location.lat,
            lon: this.state.location.lng,
            expiration_time: this.refs['assignment-expiration'].value * 1000 * 60 * 60 + Date.now() //Convert to ms and current timestamp
        }, (data) => {
            this.pending = false;
            this.props.updateAssignment(this.props.assignment._id);
            if(data.err) {
                $.snackbar({
                    content: 'Could not approve assignment!'
                });
            } else {
                $.snackbar({
                    content: 'Assignment Approved!'
                });
            }
        });

    }

    reject() {
        this.pending = true;
        $.post('/api/assignment/deny', {
            id: this.props.assignment._id
        }, (data) => {
            this.pending = false;
            this.props.updateAssignment(this.props.assignment._id);
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

    render() {

        var location = this.state.location,
            radius = Math.round(global.milesToFeet(this.state.radius)),
            address = this.props.assignment.location ? this.props.assignment.location.address : '',
            expiration_time = this.props.assignment ? global.hoursToExpiration(this.props.assignment.expiration_time) : null;

        if(this.props.activeGalleryType != 'assignment' || !this.props.hasActiveGallery)
            return (<div></div>);



        return (
            <div className="dialog">
                <div className="dialog-body" style={{visibility: this.props.hasActiveGallery ? 'visible' : 'hidden'}}>
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Title"
                        ref="assignment-title"
                        defaultValue={this.props.assignment.title} />
                    <textarea
                        type="text"
                        className="form-control floating-label"
                        placeholder="Description"
                        ref="assignment-description"
                        defaultValue={this.props.assignment.caption}></textarea>
                    <AutocompleteMap
                        defaultLocation={address}
                        location={location}
                        radius={radius}
                        onPlaceChange={this.onPlaceChange}
                        onRadiusUpdate={this.onRadiusUpdate}
                        rerender={true} />
                    <input
                        type="text"
                        className="form-control floating-label"
                        placeholder="Expiration Time"
                        data-hint="hours from now"
                        ref="assignment-expiration"
                        style={{marginTop: '64px'}}
                        defaultValue={expiration_time} />
                </div>
                <div className="dialog-foot">
                    <button type="button" className="btn btn-flat assignment-approve pull-right" onClick={this.approve} disabled={this.isPending}>Approve</button>
                    <button type="button" className="btn btn-flat assignment-deny pull-right" onClick={this.reject} disabled={this.isPending}>Reject</button>
                </div>
            </div>
        );
    }

}
