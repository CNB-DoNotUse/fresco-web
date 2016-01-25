import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import PostList from './../components/global/post-list.js'
import TopBar from './../components/topbar'
import global from '../../lib/global'
import LocationDropdown from '../components/global/location-dropdown'

/**
 * Location Detail Parent Object (composed of Post and Navbar)
 * @description Page for showing the content for an outlet's saved location
 */

class LocationDetail extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			onlyVerified: true,
			sort: 'capture'
		}

		this.updateSort			= this.updateSort.bind(this);
		this.loadPosts 			= this.loadPosts.bind(this);
	}

	updateSort(sort) {
		this.setState({
			sort: sort
		});
	}

	/**
	 * Returns array of posts with offset and callback, used in child PostList
	 */
	loadPosts(passedOffset, callback) {
		var params = {
			id: this.props.location._id,
			limit: global.postCount,
			verified : this.state.onlyVerified,
			offset: passedOffset,
			type: 'video',
			sort: this.state.sort
		};

		$.ajax({
			url:  '/api/outlet/location/posts',
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
					title={this.props.location.title}
					timeToggle={true}
					verifiedToggle={true}
					updateSort={this.updateSort}
					chronToggle={true}
					onVerifiedToggled={this.onVerifiedToggled}>

					<LocationDropdown />
				</TopBar>
				
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small'
					scrollable={true}
					sort={this.state.sort}
					onlyVerified={this.state.onlyVerified} />
			</App>
		);

	}

}

LocationDetail.defaultProps = {
	purchases : []
}

ReactDOM.render(
 	<LocationDetail
 		location={window.__initialProps__.location} 
 		user={window.__initialProps__.user} 
 		purchases={window.__initialProps__.purchases} />,
 	document.getElementById('app')
);
