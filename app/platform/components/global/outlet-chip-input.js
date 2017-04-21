import React from 'react';
import ChipInput from './chip-input';

/**
* RestrictByOutlet is a Chip input component that returns a text input and "send to all outlets"
* checkbox as well as displaying the currently selected outlets.
* @param {function} onChange, passed to change the state of parent component
* @param {bool} sendToAll, whether the user wants to send to all outlets
* @param {array} outlets, the outlets currently selected (display chips of)
* @param {function} updateItems, function passed to change state of parent component
*   when outlets neeed to be updated
* @param {bool} disabled, to determine if the user can edit the chosen outlets
*/
const RestrictByOutlet = ({
    onChange,
    sendToAll,
    outlets,
    updateItems,
    disabled
}) => (
    <div className="form-group-default">
        {!sendToAll && <ChipInput
            model="outlets"
            queryAttr="title"
            items={outlets}
            updateItems={updateItems}
            className="dialog-row"
            createNew
            autocomplete
            disabled={disabled}
        />}
        <div className="checkbox">
            <label>
                <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={onChange}
                    disabled={disabled}
                />
            Send to all outlets
            </label>
        </div>
    </div>
);

export default RestrictByOutlet;
