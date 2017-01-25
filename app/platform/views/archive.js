import React from 'react';
import ReactDOM from 'react-dom';
import PostsArchive from 'app/platform/components/archive/posts';

/**
 * Archive Parent View
 * @description View page for all content
 */

ReactDOM.render(
    <PostsArchive
        user={window.__initialProps__.user}
        title={window.__initialProps__.title}
        page="archive"
    />,
    document.getElementById('app')
);
