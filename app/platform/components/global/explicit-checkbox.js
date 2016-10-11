import React, { PropTypes } from 'react';

/**
 * Stateless explicit checkbox
 */
const ExplicitCheckbox = ({ is_nsfw, onChange }) => (
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

export default ExplicitCheckbox;

