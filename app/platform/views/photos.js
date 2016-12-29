import React from 'react';
import ReactDOM from 'react-dom';
import PostsArchive from 'app/platform/components/archive/posts';

/**
 * Photos Parent View
 * @description View page for all content
 */

ReactDOM.render(
    <PostsArchive
        user={window.__initialProps__.user}
        title={window.__initialProps__.title}
        page="photos"
        type="photo"
    />,
    document.getElementById('app')
);
