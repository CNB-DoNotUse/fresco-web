import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';

/**
 * Wrapper for pages using Redux
 */
const Root = ({ store, children }) => (
    <Provider store={store}>
        {children}
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node,
};

export default Root;

