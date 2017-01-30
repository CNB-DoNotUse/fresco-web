import React, { PropTypes } from 'react';
import 'app/sass/platform/dialogs/dialogs.scss';

/**
 * Base of dialog component
 */
export default class Base extends React.Component {
    static propTypes = {
        toggled: PropTypes.bool
    };

    static defaultProps = {
        toggled: false
    }

    render() {
        const { children, toggled } = this.props;

        return (
            <div className={`dialog-wrap ${toggled ? 'toggled' : ''}`}>
                <div className={`dim transparent ${toggled ? 'toggled' : ''}`} />
                {children}
            </div>
        )
    }
}