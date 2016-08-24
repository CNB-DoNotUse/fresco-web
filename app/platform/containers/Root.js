import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import App from './App';

const Root = ({ store, children }) => (
    <Provider store={store}>
        <App>
            {children}
        </App>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node,
};

export default Root;

