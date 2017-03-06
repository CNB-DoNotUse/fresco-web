import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;
import configureStore from 'app/redux/store';
import Root from '../containers/Root';
import reducer from 'app/redux/modules/outletSettings';

import OutletSettings from '../containers/OutletSettings';

const { user, outlet, stripePublishableKey, payment } = window.__initialProps__;
const store = configureStore({ user, outlet, payment }, reducer);

ReactDOM.render(
    <Root store={store}>
        <OutletSettings
            stripePublishableKey={stripePublishableKey} />
    </Root>,
    document.getElementById('app')
);