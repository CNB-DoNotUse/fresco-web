import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from 'app/redux/store';
import Root from '../containers/Root';
import Moderation from '../containers/Moderation';

const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root store={store} page='moderation'>
        <Moderation />
    </Root>,
    document.getElementById('app')
);

