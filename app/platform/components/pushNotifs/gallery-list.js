import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';

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

        <ChipInput
            model="galleries"
            attr="id"
            items={galleries}
            updateItems={onChangeGalleries(onChange)}
            className="push-notifs__chip-input"
            autocomplete={false}
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

