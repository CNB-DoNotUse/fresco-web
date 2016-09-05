import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import api from 'app/lib/api';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';


/**
 * Archive Parent Object (composed of PostList and Navbar)
 * @description View page for all content
 */
class Archive extends React.Component {
    static propTypes = {
        sortBy: PropTypes.string,
    };

    state = {
        verifiedToggle: true,
        sortBy: this.props.sortBy || 'created_at',
    };

    onVerifiedToggled = (toggled) => {
        this.setState({ verifiedToggle: toggled });
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
            params.rating = 2;
        }

        api
        .get('post/list', params)
        .then(res => { callback(res); })
        .catch(() => {
            $.snackbar({ content: 'Failed to load posts' });
        });
    }

    updateSort = (sortBy) => {
        this.setState({ sortBy });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    title={this.props.title}
                    updateSort={this.updateSort}
                    permissions={this.props.user.permissions}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    permissions={this.props.user.permissions}
                    sortBy={this.state.sortBy}
                    size="small"
                    onlyVerified={this.state.verifiedToggle}
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
