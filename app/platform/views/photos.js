import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import { createGetFromStorage, createSetInStorage } from 'app/lib/storage';
import App from './app';
import PostList from './../components/post/list';
import TopBar from './../components/topbar';

const getFromStorage = createGetFromStorage({ key: 'photos' });
const setInStorage = createSetInStorage({ key: 'photos' });

/**
 * Photos Parent Object (composed of PhotoList and Navbar)
 */
class Photos extends React.Component {
    static propTypes = {
        sortBy: PropTypes.string,
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
            type: 'photo',
            sortBy: this.state.sortBy,
            rating: [0, 1, 2],
        };

        if (this.state.verifiedToggle) {
            params.rating = 2;
        }

        api
        .get('post/list', params)
        .then(res => { callback(res); })
        .catch(() => {
            $.snackbar({ content: 'Failed to load posts' });
            callback([]);
        });
    }

    render() {
        const { user } = this.props;
        const { sortBy, verifiedToggle } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title="Photos"
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
                    permissions={user.permissions}
                    size="small"
                    sortBy={sortBy}
                    onlyVerified={verifiedToggle}
                    loadPosts={this.loadPosts}
                    scrollable
                />
            </App>
        );
    }
}


ReactDOM.render(
    <Photos user={window.__initialProps__.user} />,
    document.getElementById('app')
);
