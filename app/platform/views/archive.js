import React from 'react';
import ReactDOM from 'react-dom';
import PostsArchive from 'app/platform/components/archive/posts';
import { Provider } from 'react-redux';
import configureStore from 'app/redux/store/immutableStore';
import injectTapEventPlugin from 'react-tap-event-plugin';
/**
 * Archive Parent View
 * @description View page for all content
 */

 injectTapEventPlugin();

 const store = configureStore();
 ReactDOM.render(
     <Provider store={ store }>
        <PostsArchive
            user={window.__initialProps__.user}
            title={window.__initialProps__.title}
            page="archive"
        />
    </Provider>,
    document.getElementById('app')
);
