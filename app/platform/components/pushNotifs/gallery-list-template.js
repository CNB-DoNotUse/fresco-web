import React, { PropTypes } from 'react';
import AutocompletChipInput from '../global/autocomplete-chip-input';

const onChangeTitle = (onChange) => (e) => {
    onChange({ title: e.target.value });
};

const onChangeBody = (onChange) => (e) => {
    onChange({ body: e.target.value });
};

const onChangeGalleries = (onChange) => (galleries) => {
    onChange({ galleries });
};

const Template = ({
    title,
    body,
    galleries,
    onChange }) => (
    <div>
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

        <AutocompletChipInput
            model="galleries"
            attr="caption"
            items={galleries}
            updateItems={onChangeGalleries(onChange)}
            className="push-notifs__galleries"
            initMaterial
        />

    </div>
);

Template.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    galleries: PropTypes.array,
    onChange: PropTypes.func,
};

export default Template;

