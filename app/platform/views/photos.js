import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';

/**
 * Photos Parent Object (composed of PhotoList and Navbar)
 */
class Photos extends React.Component {
    static propTypes = {
        sortBy: PropTypes.string,
    };

    state = {
        showVerified: true,
        sortBy: this.props.sortBy || 'created_at',
    };

    onVerifiedToggled = (toggled) => {
        this.setState({ showVerified: toggled });
    }

    updateSort = (sortBy) => {
        this.setState({ sortBy });
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

        if (this.state.showVerified) {
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
        const { sortBy, showVerified } = this.state;

        return (
            <App user={user}>
                <TopBar
                    title="Photos"
                    permissions={user.permissions}
                    updateSort={this.updateSort}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />
                <PostList
                    permissions={user.permissions}
                    size="small"
                    sortBy={sortBy}
                    onlyVerified={showVerified}
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
