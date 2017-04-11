import React, { PropTypes } from 'react';
import ChipInput from '../global/chip-input';
import TitleBody from './title-body';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const onChangeGalleries = (onChange) => (galleries) => {
    onChange({ galleries });
};

/**
* Gallery List template
* This component is a functional component that displays title and body text input
* fields, chip inputs for galleries, and filter by location or users
*/

const Template = ({
    galleries,
    onChange,
    onChangeAsync,
    ...props }) => (
    <div>
        <TitleBody onChange={onChange} {...props} />

        <ChipInput
            model="galleries"
            queryAttr="id"
            items={galleries}
            updateItems={onChangeGalleries(onChangeAsync)}
            className="push-notifs__chip-input"
            autocomplete={false}
            initMaterial
        />

        <RestrictByLocation onChange={onChangeAsync} {...props} />
        <RestrictByUser onChange={onChangeAsync} {...props} />
    </div>
);

Template.propTypes = {
    galleries: PropTypes.array,
    onChange: PropTypes.func,
    onChangeAsync: PropTypes.func,
};

export default Template;
