import React from 'react'
import ReactDOM from 'react-dom'
import PostList from './../components/post-list.js'
import TopBar from './../components/topbar.js'
import App from './app.js'

/**
 * Videos Parent Object (composed of Post and Navbar)
 */

class Videos extends React.Component {

	constructor(props) {
		super(props);
		this.loadPosts = this.loadPosts.bind(this);
	}

	render() {

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Photos"
					timeToggle={true}
					verifiedToggle={true}
					chronToggle={true} />
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small'
					scrollable={true} />
			</App>
		);

	}

	//Returns array of posts with offset and callback, used in child PostList
	loadPosts (passedOffset, callback) {

		var endpoint = '/v1/post/list',
				params = {
					limit: 14,
					verified : true,
					offset: passedOffset,
					type: 'video'
				};

		$.ajax({
			url:  API_URL + endpoint,
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {

				//Do nothing, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: (xhr, status, error) => {
				$.snackbar({content: resolveError(error)});
			}

		});

	}

}

Videos.defaultProps = {
	purchases : []
}

ReactDOM.render(
 	<Videos 
 		user={window.__initialProps__.user} 
 		purchases={window.__initialProps__.purchases} />,
 	document.getElementById('app')
);
