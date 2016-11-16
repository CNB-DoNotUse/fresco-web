import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';

/**
 * Videos Parent Object (composed of Post and Navbar)
 */
class Videos extends React.Component {
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
            type: 'video',
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
            $.snackbar({ content: 'Failed to load videos' });
            callback([]);
        });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    title="Videos"
                    permissions={this.props.user.permissions}
                    updateSort={this.updateSort}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    permissions={this.props.user.permissions}
                    size="small"
                    sortBy={this.state.sortBy}
                    onlyVerified={this.state.showVerified}
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
