import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const onChangeAssignments = (onChange) => (assignments) => {
    onChange({ assignments: assignments.map(a => ({ id: a.id, title: a.title })) });
};

const Template = ({
    assignments,
    onChange,
    ...props }) => (
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

        <RestrictByLocation onChange={onChange} {...props} />
        <RestrictByUser onChange={onChange} {...props} />
    </div>
);


Template.propTypes = {
    assignments: PropTypes.array,
    onChange: PropTypes.func,
};

export default Template;

