import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import TitleBody from './title-body';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const onChangeGalleries = (onChange) => (gallery) => {
    onChange({ gallery: gallery[0] || null });
};

const onChangeStories = (onChange) => (story) => {
    onChange({ story: story[0] ? { id: story[0].id, title: story[0].title } : null });
};

const Template = ({
    gallery,
    story,
    onChange,
    ...props }) => (
    <div>
        <TitleBody onChange={onChange} {...props} />

        <ChipInput
            model="galleries"
            queryAttr="id"
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
            queryAttr="title"
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
    gallery: PropTypes.object,
    story: PropTypes.object,
    onChange: PropTypes.func,
};

export default Template;

