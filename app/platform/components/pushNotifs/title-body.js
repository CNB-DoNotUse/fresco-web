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
    // onlyOneField
}) => {
    // I added this portion to be able to have support request have only one field
    // however, this is not sufficient since the title parameter is required 

    // if (onlyOneField) {
    //     return (
    //         <span>
    //             <textarea
    //                 type="text"
    //                 className="form-control floating-label"
    //                 placeholder="Body"
    //                 value={body || ''}
    //                 onChange={onChangeBody(onChange)}
    //             />
    //         </span>
    //     );
    // }

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
