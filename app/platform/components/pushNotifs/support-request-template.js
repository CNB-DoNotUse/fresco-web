import React, { PropTypes } from 'react';
import TitleBody from './title-body';
import { RestrictByUser } from './restrict-by';

const SupportRequest = ({
    onChange,
    onChangeAsync,
    ...props }) => {
        console.log("here");
    return (
        <div>
            <TitleBody onChange={onChange} {...props} />

            <RestrictByUser onChange={onChangeAsync} {...props} />
        </div>

    );
}

SupportRequest.propTypes = {
    onChange: PropTypes.func,
    onChangeAsync: PropTypes.func,
};

export default SupportRequest;
