import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from 'app/redux/store/immutableStore.js';
import Root from '../containers/Root';
import Moderation from '../containers/Moderation';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root store={store}>
        <MuiThemeProvider>
            <Moderation />
        </MuiThemeProvider>
    </Root>,
    document.getElementById('app')
);

