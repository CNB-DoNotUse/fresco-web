import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import { createGetFromStorage, createSetInStorage } from 'app/lib/storage';
import App from './app';
import PostList from './../components/post/list';
import TopBar from './../components/topbar';

const getFromStorage = createGetFromStorage({ key: 'archive' });
const setInStorage = createSetInStorage({ key: 'archive' });

/**
 * Archive Parent Object (composed of PostList and Navbar)
 * @description View page for all content
 */
class Archive extends React.Component {
    static propTypes = {
        sortBy: PropTypes.string,
        title: PropTypes.string,
        user: PropTypes.object,
    };

    state = {
        verifiedToggle: getFromStorage('verifiedToggle', true),
        sortBy: this.props.sortBy || 'created_at',
    };

    onVerifiedToggled = (toggled) => {
        this.setState({ verifiedToggle: toggled });
        setInStorage({ verifiedToggle: toggled });
    }

    // Returns array of posts with last and callback, used in child PostList
    loadPosts = (last, callback) => {
        const params = {
            last,
            limit: utils.postCount,
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
        };

        if (this.state.verifiedToggle) {
            params.rating = [2];
        }

        api
        .get('post/list', params)
        .then(callback)
        .catch(() => {
            $.snackbar({ content: 'We\'re unable to load the archive right now!' });
            callback([]);
        });
    }

    updateSort = (sortBy) => {
        this.setState({ sortBy });
    }

    render() {
        const { verifiedToggle, sortBy } = this.state;
        const { user, title } = this.props;
        return (
            <App user={user}>
                <TopBar
                    title={title}
                    updateSort={this.updateSort}
                    permissions={user.permissions}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle ? '' : 'all'}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    permissions={user.permissions}
                    sortBy={sortBy}
                    size="small"
                    onlyVerified={verifiedToggle}
                    scrollable
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Archive
        user={window.__initialProps__.user}
        title={window.__initialProps__.title}
    />,
    document.getElementById('app')
);
