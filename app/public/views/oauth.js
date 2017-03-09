import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';;
import configureStore from 'app/redux/store';
import Root from '../../platform/containers/Root';
import reducer from 'app/redux/modules/oauth';

import OAuth from '../containers/Oauth';

const store = configureStore(window.__initialProps__, reducer);

ReactDOM.render(
    <Root store={store}>
        <OAuth />
    </Root>,
    document.getElementById('app')
);