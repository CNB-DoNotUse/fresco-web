import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from 'app/redux/store/immutableStore';
import Root from '../containers/Root';
import PushNotifs from '../containers/PushNotifs';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root store={store}>
        <MuiThemeProvider>
            <PushNotifs />
        </MuiThemeProvider>
    </Root>,
    document.getElementById('app')
);
