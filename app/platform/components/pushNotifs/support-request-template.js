import React, { PropTypes } from 'react';
import TitleBody from './title-body';
import { RestrictByUser } from './restrict-by';

/**
* Support template
* This component is a functional component that displays one text body
* and obligates the user filter
*/

const Support = ({
    onChange,
    onChangeAsync,
    ...props }) => {
    return (
        <div>
            <TitleBody
                onlyOneField={true}
                onChange={onChange} {...props} />

            <RestrictByUser
                restrictByUser={true}
                multipleUsers={false}
                disabled={true}
                onChange={onChangeAsync} {...props} />
        </div>

    );
}

Support.propTypes = {
    onChange: PropTypes.func,
    onChangeAsync: PropTypes.func,
};

export default Support;
