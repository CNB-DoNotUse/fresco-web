import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;
import configureStore from 'app/redux/store';
import reducer from 'app/redux/modules/outletSettings';

import OutletSettings from '../containers/OutletSettings';

const { user, outlet, stripePublishableKey, payment } = window.__initialProps__;
const store = configureStore({ user, outlet, payment }, reducer);

const Root = ({ store, page }) => (
    <Provider store={store}>
        <OutletSettings
            stripePublishableKey={stripePublishableKey} />
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired
};

ReactDOM.render(
    <Root 
        store={store} 
        page='outletSettings' />,
    document.getElementById('app')
);
