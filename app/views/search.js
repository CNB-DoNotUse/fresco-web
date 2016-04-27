import _ from 'lodash'
import global from '../../lib/global'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import LocationDropdown from '../components/topbar/location-dropdown'
import TagFilter from '../components/topbar/tag-filter'
import SearchSidebar from './../components/search/search-sidebar'
import PostList from './../components/global/post-list.js'

export class Search extends React.Component {

	constructor(props) {
		super(props);

		this.state = this.computeInitialState();

		this.loadingPosts = false;
		this.loadingUsers = false;

		this.getTitle 				= this.getTitle.bind(this);
		this.getAssignments			= this.getAssignments.bind(this);
		this.getPosts				= this.getPosts.bind(this);
		this.getUsers				= this.getUsers.bind(this);
		this.getStories				= this.getStories.bind(this);
		this.onVerifiedToggled		= this.onVerifiedToggled.bind(this);
		this.addTag					= this.addTag.bind(this);
		this.removeTag				= this.removeTag.bind(this);
		this.scroll  				= this.scroll.bind(this);
		this.onMapDataChange		= this.onMapDataChange.bind(this);
		this.onRadiusUpdate			= this.onRadiusUpdate.bind(this);
		this.refreshData			= this.refreshData.bind(this);
		this.computeInitialState    = this.computeInitialState.bind(this);
		this.pushState				= this.pushState.bind(this);
	}

	/**
	 * Computes initial state based on query params
	 */
	computeInitialState() {
		var location = this.props.location,
			title = '';

		if(location.radius && location.coordinates ) {
			var circle = new google.maps.Circle({
					center: location.coordinates,
					map: null,
					radius: global.feetToMiles(location.radius)
				});

			location.polygon = global.circleToPolygon(circle, 16);
		}

		return {
			assignments: [],
			posts: [],
			users: [],
			location: location,
			stories: [],
			offset: 0,
			title: this.getTitle(true),
			userOffset: 0,
			verifiedToggle: true,
			tags: this.props.tags,
			purchases: this.props.purchases,
		}
	}

	componentWillMount() {
		//Load intial set of data
		this.refreshData(false);

		// If has location in state, get address from LatLng. 
		// Location dropdown will use this as it's defaultLocation
		if(this.state.location.coordinates) {
			var geocoder = new google.maps.Geocoder(),
				location = this.state.location;

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

		if(JSON.stringify(prevState.location.coordinates) !== JSON.stringify(this.state.location.coordinates)) {
			shouldUpdate = true;
		} else if(prevState.location.radius !== this.state.location.radius) {
			shouldUpdate = true;
		} else if(JSON.stringify(prevState.tags) !== JSON.stringify(this.state.tags)){
			shouldUpdate = true;
		} else if(prevState.verifiedToggle !== this.state.verifiedToggle) {
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

	getTitle(withProps) {
		var state = withProps ? this.props : this.state,
			title = '';

		if(this.props.query !== '') {
			title = 'Results for ' + this.props.query;
		} else if(state.tags.length) {
			title = 'Results for tags ' + state.tags.join(', ');
		} else if(state.location && state.location.address) {
			title = 'Results from ' + state.location.address;
		}	

		return title;
	}

	/**
	 * Gets new search data
	 * @param {bool} initial Indicates if it is the initial data load
	 */
	refreshData(initial) {
		this.getAssignments(0);
		this.getPosts(true);
		this.getUsers(true);
		this.getStories(0);

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
	getAssignments(offset, force = true) {
		var location = this.state.location,
			params = {
				offset: offset,
				q: this.props.query,
				limit: 10,
				verified: this.state.verifiedToggle,
				tags: this.state.tags,
				lat: location.coordinates ? location.coordinates.lat : undefined,
				lon: location.coordinates ? location.coordinates.lng : undefined,
				radius: location.radius ? global.feetToMiles(location.radius) : undefined
			};

		$.get('/api/assignment/search', params, (response) => {
			if(!response.err && response.data && response.data.length > 0) {
				let assignments = force ? response.data : this.state.assignments.concat(response.data);
				
				this.setState({
					assignments: assignments
				});
			}

		})
	}

	/**
	 * Retrieves posts from API based on state
	 */
	getPosts(force = true) {
		var params = {
				q: this.props.query,
				offset: force ?  0 : this.state.offset,
				limit: 18,
				verified: this.state.verifiedToggle,
				tags: this.state.tags.join(','),
				polygon: null
			},
			location = _.clone(this.state.location);

		if(this.state.map && this.state.circle) {
			params.polygon = encodeURIComponent(
						JSON.stringify(
							global.circleToPolygon(this.state.circle, 16)
						)
					);
		} else if(location.coordinates && location.radius) {
			var circle = new google.maps.Circle({
				map: null,
				center: location.coordinates,
				radius: global.feetToMeters(location.radius)
			});

			params.polygon = JSON.stringify(global.circleToPolygon(circle, 16));
		}

		$.get('/api/gallery/search', params, (response) => {
			this.loadingPosts = false;
			
			if(!response.err && response.data) {

				let posts = null,
					offset = null;

				if(force) {
					//Setting scroll top manually because we're not using the post-list's default 
					//data mechanism
					this.refs.postList.refs.grid.scrollTop = 0;
					posts = response.data;
					offset = response.data.length;
				} else {
					posts = this.state.posts.concat(response.data);
					offset = this.state.offset + response.data.length;
				}

				this.setState({
					posts: posts,
					offset: offset
				});
			} else {
				this.setState({
					posts: [],
					offset: 0
				})
			}
		});
	}

	/**
	 * Retrieves users from API based on state
	 */
	getUsers(force = true) {
		$.get('/api/user/search', {
			q: this.props.query,
			offset: force ? 0 : this.state.userOffset,
			limit: 20
		}, (response) => {
			if(!response.err && response.data && response.data.length > 0) {
				this.loadingUsers = false;

				var users = force ? response.data : this.state.users.concat(response.data),
					userOffset = force ? response.data.length : this.state.userOffset + response.data.length;

				this.setState({
					users: users,
					userOffset: userOffset
				});
			}
		});
	}

	/**
	 * Retrieves stories from API based on state
	 */
	getStories(offset, force = true) {
		let polygon = null;

		if(this.state.map) {
			if(this.state.circle) {
				polygon = encodeURIComponent(JSON.stringify(global.circleToPolygon(this.state.circle, 16)));
			}
		} else if(this.state.location.coordinates && this.state.location.radius) {
			let circle = new google.maps.Circle({
				map: null,
				center: this.state.location.coordinates,
				radius: global.feetToMeters(this.state.radius)
			});

			polygon = encodeURIComponent(JSON.stringify(global.circleToPolygon(circle, 16)))
		}

		$.get('/api/story/search', {
			q: this.props.query,
			offset: offset,
			limit: 10,
			polygon: polygon,
		}, (response) => {
			if(!response.err && response.data && response.data.length > 0) {
				let stories = force ? response.data : this.state.stories.concat(response.data);
		
				this.setState({
					stories: stories
				});
			}
		});
	}

	addTag(tag) {
		if(this.state.tags.indexOf(tag) != -1) return;

		this.setState({
			tags: this.state.tags.concat(tag)
		});
	}

	removeTag(tag) {
		var index = this.state.tags.indexOf(tag);
		
		if(index == -1) return;

		var tags = [], 
			currentTags = this.state.tags;

		for(var i = 0; i < currentTags.length; i++) {
			if(currentTags[i] !== tag) {
				tags.push(currentTags[i]);
			}
		}

		this.setState({
			tags: tags
		});
	}

	/**
	 * When radius changes
	 */
	onRadiusUpdate(radius) {
		var location = _.clone(this.state.location);
		location.radius = radius;

		this.setState({
			location: location
		});
	}

	/**
	 * Called when AutocompleteMap data changes
	 * Returns a location coordinate,
	 * Google Maps Circle,
	 * Radius
	 */
	onMapDataChange(data) {
		var location = _.clone(this.state.location);

		location.coordinates = data.location;
		location.address = data.address;

		if(!location.radius)
			location.radius = 250;

		this.setState({
			location: location,
			map: {
				circle: data.circle
			}
		});
	}

	/**
	 * Updates URL push state for latest query based on state
	 */
	pushState() {
		var state = this.state,
			query = '?q=';

		query += encodeURIComponent(this.props.query);

		for (var i = 0; i < state.tags.length; i++) {
			query += '&tags[]=' + encodeURIComponent(this.state.tags[i]);
		}

		if(state.location.coordinates && state.location.radius){
			query += '&lat=' + state.location.coordinates.lat + '&lon=' + state.location.coordinates.lng;
			query += '&radius=' + state.location.radius;
		}

		window.history.pushState({}, '', query);
	}

	// Called when posts div scrolls
	scroll(e) {
		var grid = e.target,
			bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400);

		//Check that nothing is loading and that we're at the end of the scroll,
		if(!this.loadingPosts && bottomReached) {
			this.loadingPosts = true;

			// Pass current offset to getPosts
			this.getPosts(false);
		}

		//Check that nothing is loading and that we're at the end of the scroll,
		if(!this.loadingUsers && bottomReached){
			this.loadingUsers = true;

			this.getUsers(false);
		}
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.state.title}
					timeToggle={true}
					verifiedToggle={true}
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
	    				onlyVerified={this.state.verifiedToggle}
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
	tags: []
}


ReactDOM.render(
 	<Search
 		user={window.__initialProps__.user}
 		purchases={window.__initialProps__.purchases || []}
 		location={window.__initialProps__.location}
 		tags={window.__initialProps__.tags}
 		query={window.__initialProps__.query} />,
 	document.getElementById('app')
);
