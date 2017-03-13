import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import configureStore from 'app/redux/store';
import Root from '../../platform/containers/Root';
import reducer from 'app/redux/modules/oauth';
import OAuth from '../containers/OAuth';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const store = configureStore(window.__initialProps__, reducer);

ReactDOM.render(
    <Root store={store}>
        <MuiThemeProvider>
            <OAuth />
        </MuiThemeProvider>
    </Root>,
    document.getElementById('app')
);