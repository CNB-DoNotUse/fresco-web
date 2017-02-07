import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from 'app/redux/store/immutableStore';
import Root from '../containers/Root';
import PushNotifs from '../containers/PushNotifs';

const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root 
        store={store}
        page='moderation'>
        <PushNotifs />
    </Root>,
    document.getElementById('app')
);

