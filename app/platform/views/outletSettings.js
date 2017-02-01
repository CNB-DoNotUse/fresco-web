import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;

import configureStore from 'app/redux/store';
import reducer from 'app/redux/modules/outletSettings';
import OutletSettings from '../containers/OutletSettings';

const { user, outlet } = window.__initialProps__;
const store = configureStore({ user, outlet }, reducer);

const Root = ({ store, children, page }) => (
    <Provider store={store}>
        <OutletSettings />
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node,
};

ReactDOM.render(
    <Root store={store} page='push' />,
    document.getElementById('app')
);
