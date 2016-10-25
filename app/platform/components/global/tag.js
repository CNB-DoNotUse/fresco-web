import React, { PropTypes } from 'react';

/**
 * Single Tag element
 */
const Tag = ({ plus, onClick, text, altText, hasAlt }) => (
    <li className="chip" onClick={onClick}>
        <div className="chip">
            <div className="icon">
                <span className={`mdi ${plus ? 'mdi-plus' : 'mdi-minus'} icon md-type-subhead`} />
            </div>

            {hasAlt ? (
                <span className="chip md-type-body1 tag">
                    <span className="chip__primary-text">
                        {`${text} `}
                        <span className="chip__alt-text">
                            {altText}
                        </span>
                    </span>
                </span>
            ) : (
                <span className="chip md-type-body1 tag">{text}</span>
            )}
        </div>
    </li>
);

Tag.propTypes = {
    text: PropTypes.string,
    altText: PropTypes.string,
    plus: PropTypes.bool,
    hasAlt: PropTypes.bool,
    onClick: PropTypes.func,
};

Tag.defaultProps = {
    text: '',
    plus: false,
    hasAlt: false
};

export default Tag;
