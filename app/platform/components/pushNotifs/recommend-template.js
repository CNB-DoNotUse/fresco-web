import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const onChangeTitle = (onChange) => (e) => {
    onChange({ title: e.target.value });
};

const onChangeBody = (onChange) => (e) => {
    onChange({ body: e.target.value });
};

const onChangeGalleries = (onChange) => (gallery) => {
    onChange({ gallery: gallery[0] });
};

const onChangeStories = (onChange) => (story) => {
    onChange({ story: { id: story[0].id, title: story.title } });
};

const Template = ({
    title,
    body,
    gallery,
    story,
    onChange,
    ...props }) => (
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
            placeholder="Gallery"
            items={(gallery && [gallery]) || []}
            updateItems={onChangeGalleries(onChange)}
            autocomplete={false}
            multiple={false}
            className="push-notifs__chip-input"
            initMaterial
        />

        <ChipInput
            model="stories"
            attr="title"
            placeholder="Story"
            items={(story && [story]) || []}
            updateItems={onChangeStories(onChange)}
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
    title: PropTypes.string,
    body: PropTypes.string,
    galleries: PropTypes.array,
    stories: PropTypes.array,
    onChange: PropTypes.func,
};

export default Template;

