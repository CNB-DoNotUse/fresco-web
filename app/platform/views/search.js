import _ from 'lodash'
import utils from 'utils'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'
import update from'react-addons-update';
import App from './app'
import TopBar from './../components/topbar'
import LocationDropdown from '../components/topbar/location-dropdown'
import TagFilter from '../components/topbar/tag-filter'
import SearchSidebar from './../components/search/search-sidebar'
import PostList from './../components/post/list.js'

export class Search extends Component {

	constructor(props) {
		super(props);

		this.state = {
			assignments: [],
			posts: [],
			users: [],
			location: this.props.location,
			stories: [],
			title: this.getTitle(true),
			verifiedToggle: true,
			tags: this.props.tags,
			purchases: this.props.purchases,
		}

		this.loadingPosts = false;
		this.loadingUsers = false;

		this.getTitle 			= this.getTitle.bind(this);
		this.geoParams			= this.geoParams.bind(this);
		this.getAssignments		= this.getAssignments.bind(this);
		this.getPosts			= this.getPosts.bind(this);
		this.getUsers			= this.getUsers.bind(this);
		this.getStories			= this.getStories.bind(this);
		this.onVerifiedToggled	= this.onVerifiedToggled.bind(this);
		this.addTag				= this.addTag.bind(this);
		this.removeTag			= this.removeTag.bind(this);
		this.scroll  			= this.scroll.bind(this);
		this.onMapDataChange	= this.onMapDataChange.bind(this);
		this.onRadiusUpdate		= this.onRadiusUpdate.bind(this);
		this.refreshData		= this.refreshData.bind(this);
		this.pushState			= this.pushState.bind(this);
	}

	componentDidMount() {
		//Load intial set of data
		this.refreshData(true);

		window.onpopstate = (event) => {
			//Reload page
			document.location.reload();
		};

		// If has location in state, get address from LatLng.
		// Location dropdown will use this as it's defaultLocation
		if(this.state.location.coordinates) {
			const geocoder = new google.maps.Geocoder();
			const { location } = this.state;

			geocoder.geocode({'location': this.state.location.coordinates}, (results, status) => {
				if(status === google.maps.GeocoderStatus.OK && results[0]){
					location.address = results[0].formatted_address;

					this.setState({
						title : this.getTitle()
					});
				}
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		let shouldUpdate = false;

		const {
			location,
			tags,
			verifiedToggle
		} = this.state;

		if(JSON.stringify(prevState.location.coordinates) !== JSON.stringify(location.coordinates)) {
			shouldUpdate = true;
		} else if(prevState.location.radius !== location.radius) {
			shouldUpdate = true;
		} else if(JSON.stringify(prevState.tags) !== JSON.stringify(tags)){
			shouldUpdate = true;
		} else if(prevState.verifiedToggle !== verifiedToggle) {
			shouldUpdate = true;
		}

		//Update if any of the conditions are true
		if(shouldUpdate) {
			this.refreshData(false);

			this.setState({
				title : this.getTitle(false)
			});
		}
	}

	/**
	 * Determins title for page
	 * @param  {BOOL} withProps If title should be determined from props or state
	 * @return {string} Returns a title
	 */
	getTitle(withProps) {
		const {
			tags,
			location
		} = withProps ? this.props : this.state;

		let title = '';

		if(this.props.query !== '') {
			title = 'Results for ' + this.props.query;
		} else if(tags.length) {
			title = 'Results for tags ' + tags.join(', ');
		} else if(location && location.address) {
			title = 'Results from ' + location.address;
		} else {
			title = "No search query!"
		}

		return title;
	}

	geoParams() {
		const { location } = this.state;

		if(location.coordinates && location.radius) {
			return {
				geo: {
					type: 'Point',
					coordinates: [
						location.coordinates.lat,
						location.coordinates.lng,
					]
				},
				radius: utils.feetToMiles(location.radius)
			}
		} else {
			return {};
		}
	}

	/**
	 * Gets new search data
	 * @param {bool} initial Indicates if it is the initial data load
	 */
	refreshData(initial) {
		this.getAssignments();
		this.getPosts();
		this.getUsers();
		this.getStories();

		if(!initial){
			this.pushState();
		}
	}

	/**
	 * Verified toggle state bind
	 */
	onVerifiedToggled(toggled) {
		this.setState({
			verifiedToggle: toggled
		});
	}

	/**
	 * Retrieves assignments based on state
	 */
	getAssignments(force = true) {
		let params = {
			q: this.props.query,
			limit: 10,
			tags: this.state.tags,
			rating: this.state.verifiedToggle ? utils.RATINGS.VERIFIED : undefined
		};

		params = Object.assign(params, this.geoParams());

		$.ajax({
			url: '/api/search',
			type: 'GET',
			data: { assignments: params },
			success: (response, status, xhr) => {
				if(!response.error && response.assignments && response.assignments.results.length > 0) {
					const assignments = response.assignments.results;

					this.setState({
						assignments: force ? assignments : this.state.assignments.concat(assignments)
					});
				}
			}
		});
	}

	/**
	 * Retrieves posts from API based on state
	 */
	getPosts(force = true) {
		let params = {
			q: this.props.query,
			limit: 18,
			tags: this.state.tags,
			sortBy: 'created_at',
			direction: 'asc',
			rating: this.state.verifiedToggle ? utils.RATINGS.VERIFIED : undefined
		};

		params = Object.assign(params, this.geoParams());

		let posts = [];

		$.ajax({
			url: '/api/search',
			type: 'GET',
			data: { posts: params },
			success: (response, status, xhr) => {
				//If the caller of this method passes force, this means that the post list will reset
				//So this ensures that the next time `loadingPosts` is checked, it'll be ready to be called again
				if(force)
					this.loadingPosts = false;

				if(!response.error && response.posts && response.posts.results) {
					//Check if there are any more posts
					//If there aren't, prevent the scroll event from making the data call
					//the next time around
					if(response.posts.results.length > 0)
						this.loadingPosts = false;

					if(force) {
						//Setting scroll top manually because we're not using the post-list's default data mechanism
						this.refs.postList.refs.grid.scrollTop = 0;
					}

					posts = response.posts.results;

					this.setState({
						posts: force ? posts : this.state.posts.concat(posts)
					});
				}
			},
			error: (xhr, status, error) => {
				this.setState({ posts });
			}
		});
	}

	/**
	 * Retrieves users from API based on state
	 */
	getUsers(force = true) {
		const params = {
			users: {
				q: this.props.query,
				last: force ? undefined : _.last(this.state.users).id,
				limit: 20
			}
		};

		$.ajax({
			url: '/api/search',
			type: 'GET',
			data: params,
			success: (response, status, xhr) => {
				if(!response.error && response.users && response.users.results.length > 0) {
					this.loadingUsers = false;

					const users = response.users.results;

					this.setState({
						users: force ? users : this.state.users.concat(users)
					});
				}
			}
		});
	}

	/**
	 * Retrieves stories from API based on state
	 */
	getStories(force = true) {
		const { location } = this.state;

		let params = {
			q: this.props.query,
			last: force ? null : _.last(this.state.stories),
			limit: 10,
			tags: this.state.tags
		}

		params = Object.assign(params, this.geoParams());

		$.ajax({
			url: '/api/search',
			type: 'GET',
			data: { stories: params },
			success: (response, status, xhr) => {
				if(!response.error && response.stories && response.stories.results.length > 0) {
					const stories = response.stories.results;

					this.setState({
						stories: force ? stories : this.state.stories.concat(stories)
					});
				}
			}
		});
	}

	addTag(tag) {
		//Check if tag exists
		if(this.state.tags.indexOf(tag) != -1) return;

		this.setState({
			tags: update(this.state.tags, {$push: [tag]}), //Add the user back to the autocomplete list
		});
	}

	removeTag(tag, index) {
		this.setState({
			tags: update(this.state.tags, {$splice: [[index, 1]]}), //Keep the filtered list updated
		});
	}

	/**
	 * When radius changes
	 */
	onRadiusUpdate(radius) {
		let location = _.clone(this.state.location);
		location.radius = radius;

		this.setState({
			location : location
		});
	}

	/**
	 * Called when AutocompleteMap data changes
	 */
	onMapDataChange(data) {
		let location = _.clone(this.state.location);

		location.coordinates = data.location;
		location.address = data.address;

		if(!location.radius)
			location.radius = 250;

		this.setState({
			location,
			map: {
				circle: data.circle
			}
		});
	}

	/**
	 * Updates URL push state for latest query based on state
	 */
	pushState() {
		const { location, tags } = this.state;
		let query = '?q=';

		query += encodeURIComponent(this.props.query);

		tags.forEach((tag) => {
			query += '&tags[]=' + encodeURIComponent(tag);
		});

		if(location.coordinates && location.radius){
			query += '&lat=' + location.coordinates.lat + '&lon=' + location.coordinates.lng;
			query += '&radius=' + location.radius;
		}

		window.history.pushState({}, '', query);
	}


	/**
	 * Called when posts div scrolls
	 */
	scroll(e) {
		const grid = e.target;
		const bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400);

		const sidebarScrolled = grid.className.indexOf('search-sidebar') > -1;

		//Check that nothing is loading and that we're at the end of the scroll,
		if(!this.loadingPosts && bottomReached && !sidebarScrolled) {
			this.loadingPosts = true;

			// Pass current offset to getPosts
			this.getPosts(false);
		}

		//Check that nothing is loading and that we're at the end of the scroll,
		if(!this.loadingUsers && bottomReached && sidebarScrolled){
			this.loadingUsers = true;

			this.getUsers(false);
		}
	}

	render() {
		return (
			<App
				query={this.props.query}
				user={this.props.user}>
				<TopBar
					title={this.state.title}
					timeToggle={true}
					verifiedToggle={true}
					rank={this.props.user.rank}
					onVerifiedToggled={this.onVerifiedToggled}>
						<TagFilter
							onTagAdd={this.addTag}
							onTagRemove={this.removeTag}
							filterList={this.state.tags}
							key="tagFilter"
						/>

						<LocationDropdown
							location={this.state.location.coordinates}
							radius={this.state.location.radius}
							defaultLocation={this.state.location.address}
							units="Miles"
							key="locationDropdown"
							onRadiusUpdate={this.onRadiusUpdate}
							onPlaceChange={this.onMapDataChange}
							onMapDataChange={this.onMapDataChange}
						/>
				</TopBar>

				<div className="col-sm-8 tall p0">
	    			<PostList
	    				posts={this.state.posts}
	    				rank={this.props.user.rank}
	    				purchases={this.props.purchases}
	    				ref="postList"
	    				size='large'
	    				scroll={this.scroll}
	    				scrollable={true}
	    			/>
    			</div>

    			<SearchSidebar
    				assignments={this.state.assignments}
    				stories={this.state.stories}
    				users={this.state.users}
    				scroll={this.scroll}
    			/>
			</App>
		);
	}
}

Search.defaultProps = {
	location: {},
	tags: [],
	q: ''
}

Search.propTypes = {
    q: PropTypes.string,
    tags: PropTypes.array,
    location: PropTypes.object,
};

ReactDOM.render(
 	<Search
 		user={window.__initialProps__.user}
 		location={window.__initialProps__.location}
 		tags={window.__initialProps__.tags}
 		query={window.__initialProps__.query} />,
 	document.getElementById('app')
);
