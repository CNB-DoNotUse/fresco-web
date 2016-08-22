import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './app';
import PushNotifications from '../components/pushNotifications';
import configureStore from '../../redux/store/configureStore';

const store = configureStore({ user: window.__initialProps__.user });

ReactDOM.render(
    <Provider store={store}>
        <App>
            <PushNotifications />
        </App>
    </Provider>,
    document.getElementById('app')
);

