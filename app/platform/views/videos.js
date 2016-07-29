import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/global/post-list.js';
import TopBar from './../components/topbar';
import utils from 'utils';

/**
 * Videos Parent Object (composed of Post and Navbar)
 */

class Videos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showVerified: true,
            sortBy: this.props.sortBy || 'created_at',
        };

        this.updateSort			= this.updateSort.bind(this);
        this.loadPosts 			= this.loadPosts.bind(this);
        this.onVerifiedToggled 	= this.onVerifiedToggled.bind(this);
    }

    onVerifiedToggled(toggled) {
        this.setState({ showVerified: toggled });
    }

    updateSort(sortBy) {
        this.setState({ sortBy });
    }

	// Returns array of posts with last and callback, used in child PostList
    loadPosts(last, callback) {
        const params = {
            last,
            limit: utils.postCount,
            type: 'video',
            sortBy: this.state.sortBy
        };

        if (this.state.showVerified) {
            params.rating = 1;
        }

        $.ajax({
            url: '/api/post/list',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (videos, status) => {
                if (status === 'success') callback(videos);
            },
            error: (xhr, status, error) => {
                $.snackbar({ content: utils.resolveError(error) });
            },
        });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    title="Videos"
                    rank={this.props.user.rank}
                    updateSort={this.updateSort}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    rank={this.props.user.rank}
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
