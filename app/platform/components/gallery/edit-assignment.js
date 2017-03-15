import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';

const EditAssignment = ({ assignments = [], onChange }) => {
    if (assignments.length > 1) {
        return (
            <ChipInput
                model="assignments"
                placeholder="Assignment"
                queryAttr="title"
                items={assignments}
                updateItems={onChange}
                className="dialog-row"
                createNew={false}
                disabled
                autocomplete
            />
        );
    }

    return (
        <ChipInput
            model="assignments"
            placeholder="Assignment"
            queryAttr="title"
            items={assignments}
            updateItems={onChange}
            className="dialog-row"
            multiple={false}
            createNew={false}
            autocomplete
        />
    );
};

EditAssignment.propTypes = {
    assignments: PropTypes.array,
    onChange: PropTypes.func,
};

export default EditAssignment;
