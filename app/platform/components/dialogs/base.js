import React, { PropTypes } from 'react';
import 'app/sass/platform/dialogs/dialogs.scss';

/**
 * Base of dialog component
 */
export default class Base extends React.Component {
    static propTypes = {
        toggled: PropTypes.bool,
        zIndex: PropTypes.number
    };

    static defaultProps = {
        toggled: false,
        zIndex: 5,
        toggle: () => {}
    };

    render() {
        const { children, toggled, zIndex } = this.props;


        return (
            <div style={{ zIndex }}
                ref='base'
                className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />
                {children}
            </div>
        )
    }
}
