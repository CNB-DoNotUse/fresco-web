import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import AutocompleteMap from '../global/autocomplete-map';

const onChangeRestrictByLocation = (onChange) => (e) => {
    onChange({
        restrictByLocation: e.target.checked,
        restrictByUser: false,
        radius: 250,
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
    if (data.source === 'markerDrag') onChange(data);
};

const onChangeUsers = (onChange) => (users) => {
    onChange({
        users: users.map(u => ({ id: u.id, full_name: u.full_name, username: u.username })),
    });
};

const onRadiusChange = (onChange) => (radius) => {
    onChange({ radius });
};

/**
* Restrict by location component that first displays a checkbox, and once checked
* will include a google maps snippet
*
*/

export const RestrictByLocation = ({
    restrictByLocation = false,
    onChange,
    location,
    address,
    radius
}) => (
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

/**
* Restrict by user component that first displays a checkbox, and once checked
* will include text input field that displays users that satisfy the search criteria
* default state is checked
* @param {bool} restrictByUser default checked state
* @param {bool} multipleUsers whether filter accepts multiple users or just one
*/

export const RestrictByUser = ({
    restrictByUser = true,
    onChange,
    disabled = false,
    multipleUsers = true,
    users
}) => (
    <span>
        <div className="checkbox form-group push-notifs__checkbox">
            <label>
                <input
                    type="checkbox"
                    disabled={disabled}
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
                className="push-notifs__users"
                createNew={false}
                multiple={multipleUsers}
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
