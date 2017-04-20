import React, { PropTypes } from 'react';

/**
* Component that displays title and body input fields that are used for
* push notification forms
* @param {string} title the message title
* @param {string} body the message body
* @param {bool} onlyOneField whether to display both title and body or just body
*/

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
    onlyOneField,
    placeholderTitle = "Title",
    placeholderBody = "Body"
}) => {
    if (onlyOneField) {
        return (
            <span>
                <textarea
                    type="text"
                    className="form-control floating-label"
                    placeholder={placeholderBody}
                    value={body || ''}
                    onChange={onChangeBody(onChange)}
                />
            </span>
        );
    }

    return(
        <span>
            <input
                type="text"
                className="form-control floating-label"
                placeholder={placeholderTitle}
                value={title || ''}
                onChange={onChangeTitle(onChange)}
            />

            <textarea
                type="text"
                className="form-control floating-label"
                placeholder={placeholderBody}
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
