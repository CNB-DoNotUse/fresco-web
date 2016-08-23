import React, { PropTypes } from 'react';
import AutocompleteMap from '../global/autocomplete-map';

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

const DefaultTemplate = ({
    title,
    body,
    restrictByLocation = false,
    restrictByUser = false,
    location,
    users,
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

        <div className="checkbox form-group push-notifications__checkbox">
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
                disabled={false}
                onPlaceChange={() => {}}
                onLocationChange={() => {}}
                draggable
            />
            : null
        }

        <div className="checkbox form-group push-notifications__checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={restrictByUser}
                    onChange={onChangeRestrictByUser(onChange)}
                />
                Restrict by users
            </label>
        </div>
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    location: PropTypes.array,
    users: PropTypes.array,
    restrictByLocation: PropTypes.bool,
    restrictByUser: PropTypes.bool,
    onChange: PropTypes.func,
};

export default DefaultTemplate;

