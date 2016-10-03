import React from 'react';
import ReactDOM from 'react-dom';
import configureStore from 'app/redux/store/configureStore';
import Root from '../containers/Root';
import Moderate from '../containers/Moderate';

const { user } = window.__initialProps__;
const store = configureStore({ user });

ReactDOM.render(
    <Root store={store}>
        <Moderate />
    </Root>,
    document.getElementById('app')
);

