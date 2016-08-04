import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import PostList from './../components/post/list.js';
import TopBar from './../components/topbar';
import utils from 'utils';

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
            showVerified: true,
            sortBy: this.props.sortBy || 'created_at',
        };

        this.loadPosts 			= this.loadPosts.bind(this);
        this.updateSort 		= this.updateSort.bind(this);
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
            type: 'photo',
            sortBy: this.state.sortBy
        };

        if (this.state.showVerified) {
            params.rating = 2;
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
                    size="small"
                    sortBy={this.state.sortBy}
                    onlyVerified={this.state.showVerified}
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
