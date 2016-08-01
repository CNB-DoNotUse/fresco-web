import React, { PropTypes } from 'react';
import utils from 'utils';
import EditOutlets from './edit-outlets';
import AutocompleteMap from '../global/autocomplete-map';
import moment from 'moment';

class AssignmentEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getStateFromProps(props);
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
	 * Saves the assignment from the current values in the form
	 */
    onSave() {
        const { assignment, save, loading } = this.props;
        const { title, caption, radius, location, address, endsAt, outlets } = this.state;
        const { outlets_add, outlets_remove } = utils.getRemoveAddParams(
            'outlets',
            assignment.outlets,
            outlets
        );

        const params = {
            address,
            caption,
            radius: utils.feetToMiles(radius),
            location: utils.getGeoFromCoord(location),
            outlets_add,
            outlets_remove,
            title,
            ends_at: endsAt,
        };

        if (!assignment || !assignment.id || loading) return;

        if (!outlets || !outlets.length) {
            $.snackbar({ content: 'An assignment must have at least one outlet!' });
            return;
        }
        if (utils.isEmptyString(params.title)) {
            $.snackbar({ content: 'An assignment must have a title!' });
            return;
        }
        if (utils.isEmptyString(params.caption)) {
            $.snackbar({ content: 'An assignment must have a caption!' });
            return;
        }
        if (params.address === '') {
            $.snackbar({ content: 'An assignment must have a location1' });
            return;
        }
        if (!utils.isValidRadius(params.radius)) {
            $.snackbar({ content: 'Radius must be at least 250ft!' });
            return;
        }
        if (isNaN(params.ends_at) || params.ends_at === 0) {
            $.snackbar({ content: 'Expiration time must be a number greater than 0!' });
            return;
        }

        save(assignment.id, params);
    }

    getStateFromProps(props) {
        const { assignment } = props;
        const radius = assignment.radius
            ? utils.milesToFeet(assignment.radius)
            : 250;

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
                <div className="dialog-col col-xs-12 col-md-5">
                    <div className="dialog-row map-group">
                        <AutocompleteMap
                            address={address}
                            location={location}
                            radius={radius}
                            onRadiusUpdate={(r) => this.setState({ radius: r })}
                            onPlaceChange={(p) => this.onPlaceChange(p)}
                            onMapDataChange={(d) => this.onMapDataChange(d)}
                            draggable
                            rerender
                            hasRadius
                        />
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

