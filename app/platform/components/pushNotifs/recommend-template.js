import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import TitleBody from './title-body';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const onChangeGalleries = (onChange) => (gallery) => {
    onChange({ gallery: gallery[0] });
};

const onChangeStories = (onChange) => (story) => {
    onChange({ story: { id: story[0].id, title: story.title } });
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
    gallery: PropTypes.object,
    story: PropTypes.object,
    onChange: PropTypes.func,
};

export default Template;

