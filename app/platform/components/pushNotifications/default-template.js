import React, { PropTypes } from 'react';

const onChangeTitle = (onChange) => (e) => {
    onChange({ title: e.target.value });
};

const onChangeBody = (onChange) => (e) => {
    onChange({ body: e.target.value });
};

const DefaultTemplate = ({
    title,
    body,
    // restrictedLocations,
    // restrictedUsers,
    onChange }) => (
    <div>
        <h2>Default Template</h2>

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
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    restrictedLocations: PropTypes.array,
    restrictedUsers: PropTypes.array,
    onChange: PropTypes.func,
};

export default DefaultTemplate;

