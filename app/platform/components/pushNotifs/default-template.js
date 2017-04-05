import React, { PropTypes } from 'react';
import TitleBody from './title-body';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const DefaultTemplate = ({
    onChange,
    onChangeAsync,
    ...props }) => (
    <div>
        <TitleBody onChange={onChange} {...props} />
        <RestrictByLocation onChange={onChangeAsync} {...props} />
        <RestrictByUser onChange={onChangeAsync} {...props} />
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    onChange: PropTypes.func,
    onChangeAsync: PropTypes.func,
};

export default DefaultTemplate;
