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
            Edit all locations
            </label>
        </div>
    </div>
);


export const GenericCheckbox = ({ checked, text, className, onChange }) => (
    <div className={`dialog-row ${className}`}>
        <div className="checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={ checked }
                    onChange={ onChange }
                />
            <p className={ checked ? "bold" : ""}>{ text }</p>
            </label>
        </div>
    </div>
);

// generic two input radio...input1 is checked first
export const GenericRadio = ({ input1, input2, name, className, onChange }) => (
    <div className={`${ className }`}>
        <div className="dialog-row radio">
            <label>
                <input
                    type="radio"
                    name={ name }
                    value={ input1 }
                    onChange={() => onChange(true) }
                /><p>{ input1 }</p>
            </label>
        </div>
        <div className="dialog-row radio">
            <label>
                <input
                    type="radio"
                    name={ name }
                    value={ input2 }
                    onChange={ () => onChange(false) }
                /><p>{ input2 }</p>
            </label>
        </div>
    </div>
);
