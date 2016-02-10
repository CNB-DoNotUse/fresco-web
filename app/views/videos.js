import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import PostList from './../components/global/post-list.js'
import TopBar from './../components/topbar'
import global from '../../lib/global'

/**
 * Videos Parent Object (composed of Post and Navbar)
 */

class Videos extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			verifiedToggle: true,
			sort: 'capture'
		}

		this.updateSort			= this.updateSort.bind(this);
		this.loadPosts 			= this.loadPosts.bind(this);
		this.onVerifiedToggled 	= this.onVerifiedToggled.bind(this);
	}

	onVerifiedToggled(toggled) {
		this.setState({
			verifiedToggle: toggled
		});
	}

	updateSort(sort) {
		this.setState({
			sort: sort
		});
	}

	//Returns array of posts with offset and callback, used in child PostList
	loadPosts(passedOffset, callback) {

		var params = {
			limit: global.postCount,
			offset: passedOffset,
			type: 'video',
			sort: this.state.sort
		};

		if(this.state.verifiedToggle)
			params.verified = this.state.verifiedToggle;

		$.ajax({
			url:  '/api/post/list',
			type: 'GET',
			data: params,
			dataType: 'json',
			success: (response, status, xhr) => {

				//Send empty array, because of bad response
				if(!response.data || response.err)
					callback([]);
				else
					callback(response.data);

			},
			error: (xhr, status, error) => {
				$.snackbar({content: global.resolveError(error)});
			}

		});

	}

	render() {

		return (
			<App user={this.props.user}>
				<TopBar 
					title="Videos"
					timeToggle={true}
					verifiedToggle={true}
					updateSort={this.updateSort}
					chronToggle={true}
					onVerifiedToggled={this.onVerifiedToggled} />
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small'
					scrollable={true}
					sort={this.state.sort}
					onlyVerified={this.state.verifiedToggle} />
			</App>
		);

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
