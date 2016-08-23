import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from 'app/redux/store/configureStore';
import Root from './reduxRoot';
import PushNotifications from '../containers/PushNotifications';

const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root store={store} user={user}>
        <PushNotifications />
    </Root>,
    document.getElementById('app')
);

