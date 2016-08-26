import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';
import ChipInput from '../global/chip-input';
import Dialog from '../global/dialog';
import { getAddressFromLatLng } from 'app/lib/location';

const onChangeTitle = (onChange) => (e) => {
    onChange({ title: e.target.value });
};

const onChangeBody = (onChange) => (e) => {
    onChange({ body: e.target.value });
};

const onChangeRestrictByLocation = (onChange) => (e) => {
    onChange({ restrictByLocation: e.target.checked });
};

const onChangeRestrictByUser = (onChange) => (e) => {
    onChange({ restrictByUser: e.target.checked });
};

const onPlaceChange = (onChange) => (place) => {
    onChange({ address: place.address, location: place.location });
};

const onMapDataChange = (onChange) => (data) => {
    if (data.source === 'markerDrag') {
        getAddressFromLatLng(data.location, (address) => {
            onChange({ address, location: data.location });
        });
    }
};

const onChangeUsers = (onChange) => (users) => {
    onChange({ users });
};

const onConfirmError = (onChange) => () => {
    onChange({ error: null });
};

const DefaultTemplate = ({
    title,
    body,
    restrictByLocation = false,
    restrictByUser = false,
    location,
    address,
    users,
    error,
    onChange }) => (
    <div>
        <input
            type="text"
            className="form-control floating-label"
            placeholder="Title"
            value={title}
            onChange={onChangeTitle(onChange)}
        />

        <textarea
            type="text"
            className="form-control floating-label"
            placeholder="Body"
            value={body}
            onChange={onChangeBody(onChange)}
        />

        <div className="checkbox form-group push-notifs__checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={restrictByLocation}
                    onChange={onChangeRestrictByLocation(onChange)}
                />
                Restrict by location
            </label>
        </div>

        {restrictByLocation
            ? <AutocompleteMap
                location={location}
                address={address}
                disabled={false}
                onPlaceChange={onPlaceChange(onChange)}
                onMapDataChange={onMapDataChange(onChange)}
                draggable
                hasRadius
            />
            : null
        }

        <div className="checkbox form-group push-notifs__checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={restrictByUser}
                    onChange={onChangeRestrictByUser(onChange)}
                />
                Restrict by users
            </label>
        </div>

        {restrictByUser
            ? <ChipInput
                model="users"
                attr="username"
                items={users}
                updateItems={onChangeUsers(onChange)}
                className="push-notifs__users"
                autocomplete
                initMaterial
            />
            : null
        }

        <Dialog text={error} onConfirm={onConfirmError(onChange)} />
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    location: PropTypes.object,
    address: PropTypes.string,
    users: PropTypes.array,
    error: PropTypes.string,
    restrictByLocation: PropTypes.bool,
    restrictByUser: PropTypes.bool,
    onChange: PropTypes.func,
};

export default DefaultTemplate;

