import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import { createGetFromStorage, createSetInStorage } from 'app/lib/storage';
import App from './app';
import PostList from './../components/post/list';
import TopBar from './../components/topbar';

const getFromStorage = createGetFromStorage({ key: 'videos' });
const setInStorage = createSetInStorage({ key: 'videos' });

/**
 * Videos Parent Object (composed of Post and Navbar)
 */
class Videos extends React.Component {
    static propTypes = {
        user: PropTypes.object,
    };

    state = {
        verifiedToggle: getFromStorage('verifiedToggle', true),
        sortBy: getFromStorage('sortBy', 'created_at'),
    };

    onVerifiedToggled = (toggled) => {
        this.setState({ verifiedToggle: toggled });
        setInStorage({ verifiedToggle: toggled });
    }

    onChronToggled = (sortBy) => {
        this.setState({ sortBy });
        setInStorage({ sortBy });
    }

    // Returns array of posts with last and callback, used in child PostList
    loadPosts = (last, callback) => {
        const params = {
            last,
            limit: utils.postCount,
            type: 'video',
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
        };

        if (this.state.verifiedToggle) {
            params.rating = 2;
        }

        api
        .get('post/list', params)
        .then(callback)
        .catch(() => {
            $.snackbar({ content: 'Failed to load videos' });
            callback([]);
        });
    }

    render() {
        const { verifiedToggle, sortBy } = this.state;
        const { user } = this.props;

        return (
            <App user={user}>
                <TopBar
                    title="Videos"
                    permissions={user.permissions}
                    onChronToggled={this.onChronToggled}
                    onVerifiedToggled={this.onVerifiedToggled}
                    defaultVerified={verifiedToggle}
                    defaultChron={sortBy}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    permissions={user.permissions}
                    size="small"
                    sortBy={sortBy}
                    onlyVerified={verifiedToggle}
                    scrollable
                />
            </App>
        );
    }
}

ReactDOM.render(
    <Videos user={window.__initialProps__.user} />,
    document.getElementById('app')
);
