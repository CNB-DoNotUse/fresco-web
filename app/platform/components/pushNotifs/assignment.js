import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';

const onChangeAssignments = (onChange) => (assignments) => {
    onChange({ assignments: assignments.map(a => ({ id: a.id, title: a.title })) });
};

const Template = ({
    assignments,
    onChange }) => (
    <div>
        <ChipInput
            model="assignments"
            attr="title"
            placeholder="Assignment"
            items={assignments}
            updateItems={onChangeAssignments(onChange)}
            multiple={false}
            className="push-notifs__chip-input"
            autocomplete
            initMaterial
        />
    </div>
);

Template.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    assignments: PropTypes.array,
    onChange: PropTypes.func,
};

export default Template;

