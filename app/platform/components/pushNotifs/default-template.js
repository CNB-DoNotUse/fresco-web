import React, { PropTypes } from 'react';
import TitleBody from './title-body';
import { RestrictByLocation, RestrictByUser } from './restrict-by';

const DefaultTemplate = ({
    onChange,
    ...props }) => (
    <div>
        <TitleBody onChange={onChange} {...props} />
        <RestrictByLocation onChange={onChange} {...props} />
        <RestrictByUser onChange={onChange} {...props} />
    </div>
);

DefaultTemplate.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    onChange: PropTypes.func,
};

export default DefaultTemplate;

