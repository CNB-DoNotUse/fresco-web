import React, { PropTypes } from 'react';
import { getAddressFromLatLng } from 'app/lib/location';
import ChipInput from '../global/chip-input';
import AutocompleteMap from '../global/autocomplete-map';

const onChangeRestrictByLocation = (onChange) => (e) => {
    onChange({
        restrictByLocation: e.target.checked,
        restrictByUser: false,
    });
};

const onChangeRestrictByUser = (onChange) => (e) => {
    onChange({
        restrictByUser: e.target.checked,
        restrictByLocation: false,
    });
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
    onChange({ users: users.map(u => ({ id: u.id, full_name: u.full_name })) });
};

const onRadiusChange = (onChange) => (radius) => {
    onChange({ radius });
};

export const RestrictByLocation = ({
    restrictByLocation = false,
    onChange,
    location,
    address,
    radius }) => (
    <span>
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
            && <AutocompleteMap
                location={location}
                address={address}
                radius={radius}
                disabled={false}
                onPlaceChange={onPlaceChange(onChange)}
                onMapDataChange={onMapDataChange(onChange)}
                onRadiusUpdate={onRadiusChange(onChange)}
                draggable
                hasRadius
            />
        }
    </span>
);

RestrictByLocation.propTypes = {
    restrictByLocation: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    location: PropTypes.object,
    address: PropTypes.string,
    radius: PropTypes.number,
};

export const RestrictByUser = ({
    restrictByUser = false,
    onChange,
    users }) => (
    <span>
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
            && <ChipInput
                model="users"
                queryAttr="full_name"
                altAttr="username"
                items={users}
                updateItems={onChangeUsers(onChange)}
                className="push-notifs__users chips--autocomplete"
                createNew={false}
                search
                initMaterial
            />
        }
    </span>
);

RestrictByUser.propTypes = {
    onChange: PropTypes.func.isRequired,
    restrictByUser: PropTypes.bool,
    users: PropTypes.array,
};

