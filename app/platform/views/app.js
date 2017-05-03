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

import SnackbarModal from 'app/platform/components/dialogs/snackbar-modal';
import { checkIfInactive } from 'app/platform/components/dialogs/inactivity-alert';

/**
 * Root App Wrapper
 */
class App extends React.Component {

    state = {
        alert: false,
        title: '',
        body: '',
        timeout: 5000,
        href: ''
    }

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
        checkIfInactive(this.renderAlert);
    };

    renderAlert = ({content, href, timeout}) => {
        this.setState({ alert: true, content, href, timeout });
    }

    closeAlert = () => {
        this.setState({ alert: false, content: '', href: '', timeout: 5000 });
    }

    getChildContext() {
        return { openAlert: this.renderAlert, closeAlert: this.closeAlert };
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
        const { content, timeout, href, alert } = this.state;
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
                <div id="snackbar-container">
                    <div className={`snackbar ${ alert ? 'snackbar-opened' : ''}`}
                        onClick={this.closeAlert}>
                        <SnackbarModal
                            content={content}
                            timeout={timeout}
                            href={href}
                            />
                    </div>
                </div>
            </div>
        );
    }
}

App.childContextTypes = {
  openAlert: PropTypes.func,
  closeAlert: PropTypes.func,
};

export default App;
