import React, { PropTypes } from 'react';
import { mergeReferral } from 'app/lib/referral';
global.jQuery = require('jquery');
import Sidebar from '../components/sidebar';
import startChat from 'app/chat';
require('snackbarjs');
require('alerts');
require('script!bootstrap/dist/js/bootstrap');
require('script!bootstrap-material-design/dist/js/material');
require('script!bootstrap-material-design/dist/js/ripples');
require('script!alertify.js/dist/js/alertify');
import '../../sass/platform/screen.scss';

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
        page: 'Unknown'
    };

    componentDidMount() {
        const { user } = this.props;
        $.material.init();

        this.trackUser();
        startChat();

    }

    /**
     * Tracks page being viewed through analytics provided
     */
    trackUser() {
        const { user, page } = this.props;

        if(analytics && typeof(analytics) !== 'undefined') {
            analytics.identify(this.props.user.id, {
                name: this.props.user.full_name,
                email: this.props.user.email
            });
        }
    }

    render() {
        const { query, user, children } = this.props;
        return (
            <div>
                <div className="container-fluid">
                    <Sidebar
                        query={query}
                        user={user}
                    />

                    <div className="col-md-12 col-lg-10">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
