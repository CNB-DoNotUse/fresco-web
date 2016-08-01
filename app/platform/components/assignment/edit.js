import React, { PropTypes } from 'react';
import utils from 'utils';
import EditOutlets from './edit-outlets';
import AutocompleteMap from '../global/autocomplete-map';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

class AssignmentEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        $.material.init();
    }

    /**
     * Updates state map location when AutocompleteMap gives new location
     */
    onPlaceChange(place) {
        this.setState({ address: place.address, location: place.location });
    }

    /**
     * Listener if the google map's data changes i.e. marker moves
     */
    onMapDataChange(data) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({
            location: {
                lat: data.location.lat,
                lng: data.location.lng,
            },
        },
        (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                this.setState({
                    address: results[0].formatted_address,
                    location: data.location,
                });
            }
        });
    }

    onChangeEndsAt(e) {
        this.setState({ endsAt: moment().add(e.target.value, 'h').valueOf() });
    }

    /**
     * Called when AutocompleteMap's radius changes.
     * @param  {int} radius Radius in feet
     */
    onRadiusUpdate(radius) {
        this.setState({ radius: utils.feetToMiles(radius) });
    }

    /**
     * onChangeGlobal - called on global checkbox change
     * When global is checked, location and address set to null
     * When not checked, location and adress are set to original/default vals
     */
    onChangeGlobal() {
        if (this.isGlobalLocation()) {
            const { assignment: { location, address } } = this.props;
            this.setState({ location: location || { lat: 40.7, lng: -74 }, address });
        } else {
            this.setState({ location: null, address: null });
        }
    }

	/**
	 * Saves the assignment from the current values in the form
	 */
    onSave() {
        const { assignment, save, loading } = this.props;
        const { title, caption, radius, location, address, endsAt, outlets } = this.state;

        if (!assignment || !assignment.id || loading) return;
        if (this.hasFormErrors()) return;

        const params = {
            address,
            caption,
            radius: this.isGlobalLocation() ? undefined : radius,
            location: this.isGlobalLocation() ? null : utils.getGeoFromCoord(location),
            ...utils.getRemoveAddParams('outlets', assignment.outlets, outlets),
            title,
            ends_at: endsAt,
        };

        save(assignment.id, params);
    }

    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius || 0;

        if (!assignment) return {};

        return {
            address: assignment.address,
            caption: assignment.caption,
            endsAt: moment(assignment.ends_at).valueOf(),
            location: assignment.location,
            radius,
            title: assignment.title,
            outlets: assignment.outlets,
        };
    }

    hasFormErrors() {
        const { title, caption, radius, address, endsAt, outlets } = this.state;

        if (!outlets || !outlets.length) {
            $.snackbar({ content: 'An assignment must have at least one outlet!' });
            return true;
        }
        if (utils.isEmptyString(title)) {
            $.snackbar({ content: 'An assignment must have a title!' });
            return true;
        }
        if (utils.isEmptyString(caption)) {
            $.snackbar({ content: 'An assignment must have a caption!' });
            return true;
        }
        if (!this.isGlobalLocation() && address === '') {
            $.snackbar({ content: 'An assignment must have a location1' });
            return true;
        }
        if (!this.isGlobalLocation() && utils.milesToFeet(radius) < 250) {
            $.snackbar({ content: 'Radius must be at least 250ft!' });
            return true;
        }
        if (utils.hoursToExpiration(endsAt) < 0) {
            $.snackbar({ content: 'Expiration time must be a number greater than 0!' });
            return true;
        }

        return false;
    }

    revert() {
        // Set state back to original props
        this.setState(this.getStateFromProps(this.props));
    }

    clear() {
        this.setState({
            address: null,
            caption: null,
            endsAt: null,
            location: null,
            title: null,
            radius: null,
            outlet: null,
        });
    }

    /**
     * Reverts fields to original state
     */
    cancel() {
        this.revert();
        this.props.onToggle();
    }

    isGlobalLocation() {
        return !this.state.location || isEmpty(this.state.location);
    }

    renderHeader() {
        return (
            <div className="dialog-head">
                <span className="md-type-title">Edit assignment</span>
                <span
                    className="mdi mdi-close pull-right icon toggle-edit toggler"
                    onClick={() => this.cancel()}
                />
            </div>
        );
    }

    renderBody() {
        const { title, caption, outlets, address, location, radius, endsAt } = this.state;
        const { user } = this.props;
        const globalLocation = this.isGlobalLocation();

        return (
            <div className="dialog-body">
                <div className="dialog-col col-xs-12 col-md-7 form-group-default">
                    <div className="dialog-row">
                        <input
                            type="text"
                            className="form-control floating-label"
                            placeholder="Title"
                            title="Title"
                            ref="title"
                            value={title}
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                    </div>

                    <div className="dialog-row">
                        <textarea
                            type="text"
                            className="form-control floating-label"
                            placeholder="Caption"
                            title="Caption"
                            value={caption}
                            onChange={(e) => this.setState({ caption: e.target.value })}
                        />
                    </div>

                    {(user.rank >= utils.RANKS.CONTENT_MANAGER)
                        ? <EditOutlets
                            outlets={outlets}
                            updateOutlets={(o) => this.setState({ outlets: o })}
                        />
                        : ''
                    }

                </div>
                <div className="dialog-col col-xs-12 col-md-5 form-group-default">

                    <div className="dialog-row map-group">
                        <div className="checkbox check-global form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    onChange={() => this.onChangeGlobal()}
                                    checked={globalLocation}
                                />
                                Global
                            </label>
                        </div>

                        {globalLocation
                            ? ''
                            : <AutocompleteMap
                                address={address}
                                location={location}
                                radius={Math.round(utils.milesToFeet(radius))}
                                onRadiusUpdate={(r) => this.onRadiusUpdate(r)}
                                onPlaceChange={(p) => this.onPlaceChange(p)}
                                onMapDataChange={(d) => this.onMapDataChange(d)}
                                draggable
                                rerender
                                hasRadius
                            />
                        }
                    </div>

                    <div className="dialog-row">
                        <div className="form-group-default">
                            <input
                                type="text"
                                className="form-control floating-label"
                                data-hint="hours from now"
                                placeholder="Expiration time"
                                value={utils.hoursToExpiration(endsAt)}
                                onChange={(e) => this.onChangeEndsAt(e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderFooter() {
        const { loading } = this.props;

        return (
            <div className="dialog-foot">
                <button
                    id="story-edit-revert"
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                    onClick={() => this.revert()}
                >
                    Revert changes
                </button>
                <button
                    id="story-edit-clear"
                    type="button"
                    className="btn btn-flat"
                    disabled={loading}
                    onClick={() => this.clear()}
                >
                    Clear all
                </button>
                <button
                    id="story-edit-save"
                    type="button"
                    className="btn btn-flat pull-right"
                    disabled={loading}
                    onClick={() => this.onSave()}
                >
                    Save
                </button>
                <button
                    id="story-edit-discard"
                    type="button"
                    className="btn btn-flat pull-right toggle-edit toggler"
                    disabled={loading}
                    onClick={() => this.cancel()}
                >
                    Discard
                </button>
            </div>
        );
    }

    renderStats() {
        const { assignment } = this.props;
        const { outlets, endsAt, caption, title } = this.state;
        const address = assignment.address || 'No Address';
        const timeCreated = moment(new Date(assignment.created_at)).format('MMM Do YYYY, h:mm:ss a');
        const expiresText = (moment().diff(endsAt) > 1 ? 'Expired ' : 'Expires ') + moment(endsAt).fromNow();

        return (
            <div className="col-lg-3 visible-lg edit-current">
                <div className="meta">
                    <div className="meta-user">
                        <div>
                            <img
                                role="presentation"
                                className="img-circle img-responsive"
                                src="/images/placeholder-assignment@2x.png"
                            />
                        </div>
                        <div>
                            <span className="md-type-title">{title}</span>
                            <span id="assignment-edit-owner" className="md-type-body1">
                                {outlets[0] && outlets[0].title ? `Posted by ${outlets[0].title}` : ''}
                            </span>
                        </div>
                    </div>
                    <div className="meta-description">{caption}</div>
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

    render() {
        return (
            <div>
                <div className="dim toggle-edit toggled" />
                <div className="edit panel panel-default toggle-edit toggled">
                    {this.renderStats()}

                    <div className="col-xs-12 col-lg-9 edit-new dialog">
                        {this.renderHeader()}
                        {this.renderBody()}
                        {this.renderFooter()}
                    </div>
                </div>
            </div>
		);
    }
}

AssignmentEdit.propTypes = {
    user: PropTypes.object,
    assignment: PropTypes.object,
    onToggle: PropTypes.func,
    updateOutlet: PropTypes.func,
    save: PropTypes.func,
    loading: PropTypes.bool,
};

export default AssignmentEdit;

