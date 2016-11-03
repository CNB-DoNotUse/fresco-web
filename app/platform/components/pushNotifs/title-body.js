import React, { PropTypes } from 'react';
import TextField from 'material-ui/TextField';

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
    }) => (
    <span>
        <TextField
            hintText="Title"
            floatingLabelText="Title"
            value={title || ''}
            onChange={onChangeTitle(onChange)}
            className="mui-text-field mui-text-field--first"
            fullWidth
        />

        <TextField
            type="text"
            hintText="Body"
            floatingLabelText="Body"
            value={body || ''}
            onChange={onChangeBody(onChange)}
            className="mui-text-field"
            fullWidth
        />
    </span>
);

TitleBody.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    onChange: PropTypes.func,
};

export default TitleBody;

