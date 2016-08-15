import React, { PropTypes } from 'react';

const Loader = ({ visible, className }) => (
    <div
        className={`${className} loader`}
        style={{ display: visible ? 'inline-block' : 'none' }}
    >
        <svg className="circular" viewBox="25 25 50 50">
            <circle
                className="path"
                cx="50"
                cy="50"
                r="20"
                fill="none"
                strokeWidth="4"
                strokeMiterlimit="10"
            />
        </svg>
    </div>
);

Loader.propTypes = {
    visible: PropTypes.bool.isRequired,
    className: PropTypes.string,
};

Loader.defaultProps = {
    visible: false,
    className: '',
};

export default Loader;

