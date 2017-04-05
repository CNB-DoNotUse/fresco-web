import React, { PropTypes } from 'react';

const onChangeTitle = (onChange) => (e) => {
    onChange({ title: e.target.value });
};

const onChangeBody = (onChange) => (e) => {
    onChange({ body: e.target.value });
};

const TitleBody = ({
    title,
    body,
    onChange,
}) => {
    return(
    <span>
        <input
            type="text"
            className="form-control floating-label"
            placeholder="Title"
            value={title || ''}
            onChange={onChangeTitle(onChange)}
        />

        <textarea
            type="text"
            className="form-control floating-label"
            placeholder="Body"
            value={body || ''}
            onChange={onChangeBody(onChange)}
        />
    </span>
)};

TitleBody.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    onChange: PropTypes.func,
};

export default TitleBody;
