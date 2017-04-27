import React, { PropTypes } from 'react';

/**
 * Stateless explicit checkbox
 */
export const ExplicitCheckbox = ({ is_nsfw, onChange }) => (
    <div className="dialog-row explicit">
        <div className="checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={is_nsfw}
                    onChange={(e) => onChange(e)}
                />
                Explicit
            </label>
        </div>
    </div>
);

ExplicitCheckbox.propTypes = {
    is_nsfw: PropTypes.bool,
    onChange: PropTypes.func
}

export const EditAllLocations = ({ editAll, onChange }) => (
    <div className="dialog-row edit-all">
        <div className="checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={editAll}
                    onChange={(e) => onChange(e)}
                />
            Edit every posts location
            </label>
        </div>
    </div>
);
