import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import App from './app';

const Root = ({ store, children, user }) => (
    <Provider store={store}>
        <App user={user}>
            {children}
        </App>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    children: PropTypes.node,
};

export default Root;

