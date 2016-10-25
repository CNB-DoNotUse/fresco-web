import React, { PropTypes } from 'react';
import 'app/sass/platform/_loader';


export const Loader = ({ visible = false, className = '' }) => (
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

export const LoaderOpacity = ({ visible }) => (
    <div style={{ display: visible ? 'block' : 'none' }}>
        <div className="loader__opacity-bg" />
        <Loader className="loader--opacity" visible={visible} />
    </div>
);

LoaderOpacity.propTypes = {
    visible: PropTypes.bool.isRequired,
};
