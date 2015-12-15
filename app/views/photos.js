import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import PostList from './../components/global/post-list.js'
import TopBar from './../components/topbar'
import global from '../../lib/global'

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
			purchases: []
		}

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
					didPurchase={this.props.didPurchase}
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
					type: 'photo'
				};

		$.ajax({
			url:  global.API_URL + endpoint,
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
			error: (xhr, status, error) =>{
				$.snackbar({content: resolveError(error)});
			}

		});

	}

}

Photos.defaultProps = {
	purchases : []
}

ReactDOM.render(
 	<Photos 
 		user={window.__initialProps__.user} 
 		purchases={window.__initialProps__.purchases} />,
	document.getElementById('app')
);
