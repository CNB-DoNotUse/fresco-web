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

const onChangeStories = (onChange) => (stories) => {
    onChange({ stories });
};

const Template = ({
    title,
    body,
    galleries,
    stories,
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
            placeholder="Gallery id"
            items={galleries}
            updateItems={onChangeGalleries(onChange)}
            autocomplete={false}
            multiple={false}
            className="push-notifs__chip-input"
            initMaterial
        />

        <ChipInput
            model="stories"
            attr="id"
            placeholder="Story id"
            items={stories}
            updateItems={onChangeStories(onChange)}
            autocomplete={false}
            multiple={false}
            className="push-notifs__chip-input"
            initMaterial
        />

    </div>
);

Template.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    galleries: PropTypes.array,
    stories: PropTypes.array,
    onChange: PropTypes.func,
};

export default Template;

