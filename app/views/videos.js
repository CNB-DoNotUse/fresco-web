import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/global/post-list.js';
import TopBar from './../components/topbar';
import global from '../../lib/global';

/**
 * Videos Parent Object (composed of Post and Navbar)
 */

class Videos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showVerified: true,
            sort: this.props.sort || 'created_at',
        };

        this.updateSort			= this.updateSort.bind(this);
        this.loadPosts 			= this.loadPosts.bind(this);
        this.onVerifiedToggled 	= this.onVerifiedToggled.bind(this);
    }

    onVerifiedToggled(toggled) {
        this.setState({ showVerified: toggled });
    }

    updateSort(sort) {
        this.setState({ sort });
    }

	// Returns array of posts with last and callback, used in child PostList
    loadPosts(last, callback) {
        const params = {
            last,
            limit: global.postCount,
            type: 'video',
            sortBy: this.state.sort,
            skipped: true,
            verified: true,
        };

        if (this.state.showVerified) {
            params.skipped = false;
        }

        $.ajax({
            url: '/api/post/list',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (videos, status) => {
                if (status === 'success') {
                    callback(videos);
                }
            },
            error: (xhr, status, error) => {
                $.snackbar({ content: global.resolveError(error) });
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
                    purchases={this.props.purchases}
                    size="small"
                    sort={this.state.sort}
                    onlyVerified={this.state.showVerified}
                    scrollable
                />
            </App>
        );
    }
}

Videos.defaultProps = {
    purchases : [],
};

ReactDOM.render(
    <Videos
        user={window.__initialProps__.user}
        purchases={window.__initialProps__.purchases}
    />,
    document.getElementById('app')
);
