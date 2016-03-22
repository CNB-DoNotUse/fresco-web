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
			initialPostsLoaded: false
		}

		this.updateSort	= this.updateSort.bind(this);
		this.loadPosts 	= this.loadPosts.bind(this);
	}

	updateSort(sort) {
		this.setState({
			sort: sort
		});
	}


	componentWillMount() {
		//Set up session storage for sinceList as empty object
		if(typeof(window.sessionStorage.sinceList) !== 'object'){
			window.sessionStorage.sinceList = JSON.stringify( {} );
		} 
	}

	componentDidUpdate(prevProps, prevState) {
		//Check if we've loaded the initial set of posts
		if(this.state.initialPostsLoaded) {
			var sinceList = JSON.parse(window.sessionStorage.sinceList);

			//Update the last seen time to now after posts have been loaded
			sinceList[this.props.location._id] = Date.now();

			window.sessionStorage.sinceList = JSON.stringify(sinceList);
		}
	}

	/**
	 * Returns array of posts with offset and callback, used in child PostList
	 */
	loadPosts(passedId, callback) {

		var params = {
			id    : this.props.location._id,
			limit : global.postCount,
			last  : passedId == 0 || passedId == null ? null : passedId
		}

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
					chronToggle={true}>

					<LocationDropdown
						user={this.props.user}
						inList={true}
						outlet={this.props.outlet}
						addLocationButton={false} />
				</TopBar>
				
				<PostList
					loadPosts={this.loadPosts}
					rank={this.props.user.rank}
					purchases={this.props.purchases}
					size='small'
					idOffset={true}
					scrollable={true} />
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
 		outlet={window.__initialProps__.outlet} 
 		purchases={window.__initialProps__.purchases} />,
 	document.getElementById('app')
);
