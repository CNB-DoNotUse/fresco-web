import global from '../../../lib/global'
import React from 'react'
import AutocompleteMap from '../global/autocomplete-map'
import Dropdown from '../global/dropdown'
import AssignmentMerge from '../assignment/assignment-merge'
/**
    
    Assignment Edit Sidebar used in assignment administration page

**/

export default class AdminAssignmentEdit extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            address: null,
            radius: null,
            location: null,
            nearbyAssignments: [],
            mergeDialogToggled: false,
            assignmentToMergeInto: null
        }
        this.pending                = false;
        this.onPlaceChange          = this.onPlaceChange.bind(this);
        this.onRadiusUpdate         = this.onRadiusUpdate.bind(this);
        this.onMapDataChange        = this.onMapDataChange.bind(this);
        this.findNearbyAssignments  = this.findNearbyAssignments.bind(this);
        this.toggleMergeDialog      = this.toggleMergeDialog.bind(this);
        this.approve                = this.approve.bind(this);
        this.reject                 = this.reject.bind(this);
        // this.merge                  = this.merge.bind(this);
        this.selectMerge            = this.selectMerge.bind(this);
    }

    componentDidMount() {
        $.material.init();

        // this.findNearbyAssignments();

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

                // this.findNearbyAssignments();

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
     * Updates state map location when AutocompleteMap gives new location from drag
     */
    onMapDataChange(data) {
        if(data.source == 'markerDrag') {
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({'location': {
                lat: data.location.lat,
                lng: data.location.lng
            }}, (results, status) => {

                if(status === google.maps.GeocoderStatus.OK && results[0]) {
                    this.setState({
                        address: results[0].formatted_address,
                        location: data.location
                    });
                }
            });
        }
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

    /**
     * Finds nearby assignments
     */
    findNearbyAssignments(data) {
        if(!this.props.assignment || !this.props.assignment.caption || !this.props.assignment.location || !this.props.assignment.location.geo) return;

        let assignment = this.props.assignment;

        $.get('/api/assignment/find', {
            active: true,
            radius: assignment.location.radius,
            unpack: false,
            lat: assignment.location.geo.coordinates[1],
            lon: assignment.location.geo.coordinates[0]
        }, (assignments) => {
            this.setState({
                nearbyAssignments: assignments.data.slice(0, 5)
            });
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

    toggleMergeDialog() {
        let changedState = {
            mergeDialogToggled: !this.state.mergeDialogToggled
        };

        if(this.state.mergeDialogToggled) {
            changedState.assignmentToMergeInto = null;
        }

        this.setState(changedState);
    }

    /**
     * Called when assignment-merge-menu-item is clicked
     * @param  {[type]} id ID of assignment to be merged into
     */
    selectMerge(id) {
        $.get('/api/assignment/get', {id: id}, (assignment) => {
            if(assignment.err) return $.snackbar({ content: 'Error retrieving assignment to merge' });
            this.setState({
                assignmentToMergeInto: assignment.data
            });
            this.toggleMergeDialog();
        });
    }

    /**
     * Merges assignment into existing assignment
     * @param  {Object} data
     * @param  {String} data.title
     * @param  {String} data.caption
     * @param  {String} data.assignmentToMergeInto
     * @param  {String} data.assignmentToDelete
     */
    merge(data) {
        $.post('/api/assignment/merge', data, (resp) => {
            this.toggleMergeDialog();
            this.props.updateAssignment(data.assignmentToDelete);
            $.snackbar({ content: 'Assignment successfully merged!' });
        });
    }

    render() {
        
        var radius = Math.round(global.milesToFeet(this.state.radius)),
            address = this.state.address ? this.state.address : this.props.assignment.location ? this.props.assignment.location.address : '',
            expiration_time = this.props.assignment ? global.hoursToExpiration(this.props.assignment.expiration_time) : null;

        if(this.props.activeGalleryType != 'assignment' || !this.props.hasActiveGallery) 
            return (<div></div>);

        /**
         *  Merge button
                    <AssignmentMergeDropup
                        nearbyAssignments={this.state.nearbyAssignments}
                        selectMerge={this.selectMerge} />
         */

        return ( 
            <div className="dialog">
                <div className="dialog-body admin-assignment-edit" style={{visibility: this.props.hasActiveGallery ? 'visible' : 'hidden'}}>
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
                        location={this.state.location}
                        radius={radius}
                        onPlaceChange={this.onPlaceChange}
                        onMapDataChange={this.onMapDataChange}
                        onRadiusUpdate={this.onRadiusUpdate}
                        draggable={true}
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
                    <button type="button" className="btn btn-flat assignment-approve pull-right" onClick={this.approve} disabled={this.isPending}> Approve</button>
                    <button type="button" className="btn btn-flat assignment-deny pull-right" onClick={this.reject} disabled={this.isPending}> Reject</button>
                </div>
                <AssignmentMerge
                    assignment={this.props.assignment}
                    assignmentToMergeInto={this.state.assignmentToMergeInto}
                    toggled={this.state.mergeDialogToggled}
                    toggle={this.toggleMergeDialog}
                    merge={this.merge} />
            </div>
        );
    }

}

class AssignmentMergeDropup extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(document).click((e) => {
            // Hide dropdown on click as long as not clicking on master button.
            if($('.merge-dropdown').hasClass('active') && e.target.className != 'toggle') {
                $('.merge-dropdown').removeClass('active');
                $('.merge-dropdown .mdi-menu-up').removeClass('mdi-menu-up').addClass('mdi-menu-down');
            }
        })
    }

    render() {

        if(!this.props.nearbyAssignments.length) return <div />;

        return (
            <Dropdown
                dropdownClass="u-15 merge-dropdown"
                reverseCaretDirection={true}
                inList={true}
                title={'Merge (' + this.props.nearbyAssignments.length + ')'}>
                {this.props.nearbyAssignments.map((a, i) => {
                    return (
                        <AssignmentMergeMenuItem
                            assignment={a}
                            onClick={this.props.selectMerge.bind(null, a._id)}
                            key={i} />
                    );
                })}
            </Dropdown>
        );
    }
}

class AssignmentMergeMenuItem extends React.Component {
    render() {
        return (
            <div className="assignment-merge-menu-item" onClick={this.props.onClick}>
                <span className="assignment-title">{this.props.assignment.title}</span>
                <span className="assignment-location">{this.props.assignment.location.googlemaps}</span>
                <p className="assignment-caption">{this.props.assignment.caption}</p>
            </div>
        )
    }
}