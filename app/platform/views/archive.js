import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';
import utils from 'utils';


/**
 * Archive Parent Object (composed of PostList and Navbar)
 * @description View page for all content
 */
class Archive extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            verifiedToggle: true,
            sortBy: this.props.sortBy || 'created_at',
        };

        this.loadPosts = this.loadPosts.bind(this);
        this.updateSort = this.updateSort.bind(this);
        this.onVerifiedToggled 	= this.onVerifiedToggled.bind(this);
    }

    onVerifiedToggled(toggled) {
        this.setState({ verifiedToggle: toggled });
    }

	// Returns array of posts with last and callback, used in child PostList
    loadPosts(last, callback) {
        const params = {
            last,
            limit: utils.postCount,
            sortBy: this.state.sortBy,
        };

        if (this.state.verifiedToggle) {
            params.rating = 2;
        }

        $.ajax({
            url: '/api/post/list',
            type: 'GET',
            data: params,
            dataType: 'json',
            success: (posts, status) => {
                if (status === 'success') {
                    callback(posts);
                }
            },
            error: (xhr, status, error) => {
                $.snackbar({ content: utils.resolveError(error) });
            },
        });
    }

    updateSort(sortBy) {
        this.setState({ sortBy });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    title={this.props.title}
                    updateSort={this.updateSort}
                    rank={this.props.user.rank}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />

                <PostList
                    loadPosts={this.loadPosts}
                    rank={this.props.user.rank}
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
