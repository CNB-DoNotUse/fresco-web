import React from 'react';
import ReactDOM from 'react-dom';
import PostsArchive from 'app/platform/components/archive/posts';
import configureStore from 'app/redux/store/immutableStore';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

/**
 * Photos Parent View
 * @description View page for all content
 */
injectTapEventPlugin();

const store = configureStore();
ReactDOM.render(
    <Provider store={ store }>
        <PostsArchive
            user={window.__initialProps__.user}
            title={window.__initialProps__.title}
            page="photos"
            type="photo"
        />
    </Provider>,
    document.getElementById('app')
);
