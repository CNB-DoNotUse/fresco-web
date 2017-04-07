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

/**
* Recommend template
* This component is a functional component that displays title and body text input
* fields, chip inputs for galleries and stories, and filter by location or users
*/

const Template = ({
    gallery,
    story,
    onChange,
    onChangeAsync,
    ...props }) => (
    <div>
        <TitleBody onChange={onChange} {...props} />

        <ChipInput
            model="galleries"
            queryAttr="id"
            placeholder="Gallery"
            items={(gallery && [gallery]) || []}
            updateItems={onChangeGalleries(onChangeAsync)}
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
            updateItems={onChangeStories(onChangeAsync)}
            multiple={false}
            className="push-notifs__chip-input"
            createNew={false}
            autocomplete
            initMaterial
        />

        <RestrictByLocation onChange={onChangeAsync} {...props} />
        <RestrictByUser onChange={onChangeAsync} {...props} />
    </div>
);

Template.propTypes = {
    gallery: PropTypes.object,
    story: PropTypes.object,
    onChange: PropTypes.func,
    onChangeAsync: PropTypes.func,
};

export default Template;
