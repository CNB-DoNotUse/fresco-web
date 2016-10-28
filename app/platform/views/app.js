import React, { PropTypes } from 'react';
import Sidebar from '../components/sidebar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import '../../sass/platform/screen.scss';

global.jQuery = require('jquery');
require('snackbarjs');
require('alerts');
require('script!bootstrap/dist/js/bootstrap');
require('script!bootstrap-material-design/dist/js/material');
require('script!bootstrap-material-design/dist/js/ripples');
require('script!alertify.js/dist/js/alertify');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

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
        const { query, user, children } = this.props;
        const muiTheme = getMuiTheme({
            palette: {
                  primary1Color: '#0047BB',
            },
        });
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
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
            </MuiThemeProvider>
        );
    }
}

export default App;

