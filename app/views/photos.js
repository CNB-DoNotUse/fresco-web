import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/global/post-list.js';
import TopBar from './../components/topbar';
import global from '../../lib/global';

/** //

Description : View page for content/photos

// **/

/**
 * Photos Parent Object (composed of PhotoList and Navbar)
 */
class Photos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            purchases: [],
            showVerified: true,
            sort: this.props.sort || 'created_at',
        };

        this.loadPosts 			= this.loadPosts.bind(this);
        this.updateSort 		= this.updateSort.bind(this);
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
            type: 'photo',
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
            success: (photos) => callback(photos),
            error: (xhr) => $.snackbar({ content: xhr.responseJSON.msg }),
        });
    }

    render() {
        return (
            <App user={this.props.user}>
                <TopBar
                    title="Photos"
                    rank={this.props.user.rank}
                    updateSort={this.updateSort}
                    onVerifiedToggled={this.onVerifiedToggled}
                    chronToggle
                    timeToggle
                    verifiedToggle
                />
                <PostList
                    rank={this.props.user.rank}
                    purchases={this.props.purchases}
                    size="small"
                    sort={this.state.sort}
                    onlyVerified={this.state.showVerified}
                    loadPosts={this.loadPosts}
                    scrollable
                />
            </App>
        );
    }
}


ReactDOM.render(
    <Photos
        user={window.__initialProps__.user}
        purchases={window.__initialProps__.purchases}
    />,
    document.getElementById('app')
);
