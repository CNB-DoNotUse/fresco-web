import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import PostList from './../components/global/post-list.js'
import TopBar from './../components/topbar'
import global from './../../lib/global'

/** //

Description : View page for all content

// **/

/**
 * Archive Parent Object (composed of PostList and Navbar)
 */

class Archive extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			purchases : [],
			verifiedToggle: true,
			sort: this.props.sort || 'created_at'
		}

		this.loadPosts = this.loadPosts.bind(this);
		this.updateSort = this.updateSort.bind(this);
		this.onVerifiedToggled 	= this.onVerifiedToggled.bind(this);
	}

	onVerifiedToggled(toggled) {
		this.setState({
			verifiedToggle: toggled
		});
	}

	render() {

		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.title}
					updateSort={this.updateSort}
					rank={this.props.user.rank}
					timeToggle={true}
					verifiedToggle={true}
					onVerifiedToggled={this.onVerifiedToggled}
					chronToggle={true} />

				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					sort={this.state.sort}
					purchases={this.props.purchases}
					size='small'
					onlyVerified={this.state.verifiedToggle}
					scrollable={true} />
			</App>
		);

	}

	updateSort(sort) {
		this.setState({
			sort: sort
		})
	}

	//Returns array of posts with last and callback, used in child PostList
	loadPosts (last, callback) {

		var params = {
            last,
			limit: global.postCount,
			sortBy: this.state.sort
		};

		if (this.state.verifiedToggle) {
			params.verified = false;
        }

		$.ajax({
			url:  '/api/post/list',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (posts, status, xhr) => {
                if (status === 'success') {
                    callback(posts);
                }
			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}

		});

	}

}

ReactDOM.render(
 	<Archive
 		user={window.__initialProps__.user}
 		purchases={window.__initialProps__.purchases}
 		title={window.__initialProps__.title} />,
	document.getElementById('app')
);
