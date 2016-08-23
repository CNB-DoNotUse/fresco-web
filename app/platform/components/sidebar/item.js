import React, { PropTypes } from 'react';

const Item = ({ link, icon, text }) => {
    const active = window.location.pathname === link;
    const className = `sidebar-tab ${active ? 'active' : ''}`;

    return (
        <li className={className}>
            <a href={link}>
                <span className={`mdi ${icon} icon`} />
                <span>{text}</span>
            </a>
        </li>
    );
};

Item.propTypes = {
    link: PropTypes.string,
    icon: PropTypes.string,
    text: PropTypes.string,
};

Item.defaultProps = {
    link: '',
    icon: '',
    text: '',
};

export default Item;

