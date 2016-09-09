import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './App';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const Root = ({ store, children }) => (
    <Provider store={store}>
        <MuiThemeProvider>
            <App>
                {children}
            </App>
        </MuiThemeProvider>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node,
};

export default Root;

