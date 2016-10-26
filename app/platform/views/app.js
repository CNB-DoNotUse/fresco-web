import React, { PropTypes } from 'react';
import Sidebar from '../components/sidebar';
import '../../sass/platform/screen.scss';

global.jQuery = require('jquery');
require('snackbarjs');
require('alerts');
require('script!bootstrap/dist/js/bootstrap');
require('script!bootstrap-material-design/dist/js/material');
require('script!bootstrap-material-design/dist/js/ripples');
require('script!alertify.js/dist/js/alertify');

/**
 * Root App Wrapper
 */
class App extends React.Component {

    static propTypes = {
        query: PropTypes.string,
        user: PropTypes.object,
        children: PropTypes.node,
        contentClassName: PropTypes.string,
    };

    static defaultProps = {
        contentClassName: '',
    };

    componentDidMount() {
        $.material.init();
    }

    render() {
        const { query, user, contentClassName, children } = this.props;
        return (
            <div>
                <div className="container-fluid">
                    <Sidebar
                        query={this.props.query}
                        user={this.props.user}
                    />

                    <div className={`col-md-12 col-lg-10 ${contentClassName}`}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

