import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;
import configureStore from 'app/redux/store';
import Root from '../../platform/containers/Root';
import reducer from 'app/redux/modules/oauth';

import OAuth from '../containers/Oauth';

// const { user, outlet, stripePublishableKey, payment } = window.__initialProps__;
const store = configureStore({}, reducer);

ReactDOM.render(
    <Root store={store}>
        <OAuth />
    </Root>,
    document.getElementById('app')
);