import _ from 'lodash'
import global from '../../lib/global'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import LocationDropdown from '../components/topbar/location-dropdown'
import TagFilter from '../components/topbar/tag-filter'
import SearchGalleryList from './../components/search/search-gallery-list'
import SearchSidebar from './../components/search/search-sidebar'

export class Search extends React.Component {

	constructor(props) {
		super(props);
			
		var queryLat = this.getParameterByName('lat'),
			queryLng = this.getParameterByName('lon'),
			queryRadius = parseFloat(this.getParameterByName('r')),
			queryTags = this.getParameterByName('tags'),
			address = null,
			location = null,
			polygon = null,
			tags = [];

		if(queryRadius == 'NaN') queryRadius = 0;

		if(queryLat && queryLng) {
			location = {
				lat: parseFloat(queryLat),
				lng: parseFloat(queryLng)
			}
		}

		if(queryRadius) {

			if(location) {
				var circle = new google.maps.Circle({
					center: location,
					map: null,
					radius: global.milesToMeters(queryRadius)
				})
				polygon = this.circleToPolygon(circle, 16);
			}
		}

		if(queryTags) {
			tags = queryTags.split(',');
		}

		this.loadingGalleries = false;
		this.loadingUsers = false;

		this.state = {
			assignments: [],
			galleries: [],
			isResultsEnd: false,
			address: address,
			location: location,
			offset: 0,
			userOffset: 0,
			polygon: polygon,
			purchases: [],
			radius: Math.floor(global.milesToFeet(queryRadius)) || 250,
			verifiedToggle: true,
			stories: [],
			tags: tags,
			users: []
		}

		this.getAssignments			= this.getAssignments.bind(this);
		this.getGalleries			= this.getGalleries.bind(this);
		this.getUsers				= this.getUsers.bind(this);
		this.getStories				= this.getStories.bind(this);

		this.addTag					= this.addTag.bind(this);
		this.removeTag				= this.removeTag.bind(this);

		this.didPurchase			= this.didPurchase.bind(this);

		this.galleryScroll			= this.galleryScroll.bind(this);

		this.onVerifiedToggled		= this.onVerifiedToggled.bind(this);

		this.onMapDataChange		= this.onMapDataChange.bind(this);
		this.onRadiusUpdate			= this.onRadiusUpdate.bind(this);

		this.resetGalleries			= this.resetGalleries.bind(this);
		this.refreshData			= this.refreshData.bind(this);

		this.pushState				= this.pushState.bind(this);
	}

	componentDidMount() {
		this.getAssignments(0);
		this.pending = true;
		this.resetGalleries();
		this.getStories(0);
		this.getUsers(0);

		// If has location in state, get address from LatLng. Location dropdown will use this as it's defaultLocation
		if(this.state.location) {

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({'location': this.state.location}, (results, status) => {
				if(status === google.maps.GeocoderStatus.OK && results[0])
					this.setState({ address: results[0].formatted_address });
			});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if(JSON.stringify(prevState.location) !== JSON.stringify(this.state.location) ||
			JSON.stringify(prevState.radius) !== JSON.stringify(this.state.radius) ||
			prevState.tags.length !== this.state.tags.length ||
			prevState.verifiedToggle !== this.state.verifiedToggle) {
			this.refreshData();
		}
	}

	onVerifiedToggled(toggled) {
		this.setState({
			verifiedToggle: toggled
		});
	}

	circleToPolygon(circle, numSides) {
		var center = circle.getCenter(),
			topleft = circle.getBounds().getNorthEast(),
	  		radiusX = Math.abs(topleft.lat() - center.lat()),
	  		radiusY = Math.abs(topleft.lng() - center.lng()),
	  		points = [],
			degreeStep = Math.PI * 2 / numSides;

		for(var i = 0; i < numSides; i++){
			//var gpos = google.maps.geometry.spherical.computeOffset(center, radius, degreeStep * i);
			points.push([center.lng() + radiusY * Math.sin(i * degreeStep), center.lat() + radiusX * Math.cos(i * degreeStep)]);
		};

		// Duplicate the last point to close the geojson ring
		points.push(points[0]);

		return [ points ];
	}

	getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	// Query API for assignments
	getAssignments(offset, force) {
		$.get('/api/assignment/search', {
			q: this.props.query,
			offset: offset,
			limit: 10,
			verified: this.state.verifiedToggle,
			tags: this.state.tags,
			lat: this.state.location ? this.state.location.lat : undefined,
			lon: this.state.location ? this.state.location.lng : undefined,
			radius: this.state.radius ? global.feetToMiles(this.state.radius) : undefined
		}, (assignments) => {

			if(assignments.err || !assignments.data) return;

			this.setState({
				assignments: force ? assignments.data : this.state.assignments.concat(assignments.data),
			});
		})
	}

	// Query API for galleries
	getGalleries(offset, cb) {
		if (typeof cb == 'undefined') {
			var cb = force;
		}

		var polygon = null;

		if(this.state.map) {
			if(this.state.circle) {
				polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(this.state.circle, 16)));
			}
		}

		if(this.state.location && this.state.radius) {
			var circle = new google.maps.Circle({
				map: null,
				center: this.state.location,
				radius: global.feetToMeters(this.state.radius)
			});
			polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(circle, 16)));
		}

		$.get('/api/gallery/search', {
			q: this.props.query,
			offset: offset,
			limit: 18,
			polygon: polygon,
			verified: this.state.verifiedToggle,
			tags: this.state.tags.join(',')
		}, (galleries) => {

			if(galleries.err || !galleries.data) return cb([]);

			cb(galleries.data);

		});
	}

	// Query API for users
	getUsers(offset, force) {
		$.get('/api/user/search', {
			q: this.props.query,
			offset: offset,
			limit: 20
		}, (response) => {
			if(response.err || !response.data.length) return;

			this.loadingUsers = false;

			this.setState({
				users: force ? response.data : this.state.users.concat(response.data),
				userOffset: force ? 0 : this.state.users.length + response.data.length
			});
		});
	}

	// Query API for stories
	getStories(offset, force) {
		var polygon = null;

		if(this.state.map) {
			if(this.state.circle) {
				polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(this.state.circle, 16)));
			}
		}

		if(this.state.location && this.state.radius) {
			var circle = new google.maps.Circle({
				map: null,
				center: this.state.location,
				radius: global.feetToMeters(this.state.radius)
			});

			polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(circle, 16)))
		}

		$.get('/api/story/search', {
			q: this.props.query,
			offset: offset,
			limit: 10,
			polygon: polygon,
		}, (stories) => {

			if(stories.err || !stories.data.length) return;

			this.setState({
				stories: force ? stories.data : this.state.stories.concat(stories.data)
			});
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

		var tags = [], currentTags = this.state.tags;

		for(var x = 0; x < currentTags.length; x++) {
			if(currentTags[x] != tag) {
				tags.push(currentTags[x]);
			}
		}

		this.setState({
			tags: tags
		});
	}

	didPurchase(id) {
		this.setState({
			purchases: this.state.purchases.concat(id)
		});
	}

	// Called when gallery div scrolls
	galleryScroll(e) {
		var grid = e.target,
			bottomReached = grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400);

		//Check that nothing is loading and that we're at the end of the scroll,
		//and that we have a parent bind to load  more galleries
		if(!this.loadingGalleries && bottomReached) {
			this.loadingGalleries = true;

			// Pass current offset to getMorePurchases
			this.getGalleries(this.state.offset, (galleries) => {
				// Allow getting more results after we've gotten more results.
				// Update offset to new results length
				this.loadingGalleries = false;

				this.setState({
					galleries: this.state.galleries.concat(galleries),
					offset: this.state.galleries.length + galleries.length
				});
			});
		}

		//Check that nothing is loading and that we're at the end of the scroll,
		//and that we have a parent bind to load  more posts
		if(!this.loadingUsers && bottomReached){
			this.loadingUsers = true;

			this.getUsers(this.state.userOffset, false);
		}
	}

	/**
	 * When radius changes
	 */
	onRadiusUpdate(radius) {
		this.setState({
			radius: radius
		});
	}

	/**
	 * Called when AutocompleteMap data changes
	 * Returns a location coordinate,
	 * Google Maps Circle,
	 * Radius
	 */
	onMapDataChange(data) {
		this.setState({
			location: data.location,
			radius: data.radius,
			address: data.address,
			map: {
				circle: data.circle
			}
		});
	}

	/**
	 * Resets galleries in state back to initial offset
	 */
	resetGalleries() {
		this.getGalleries(0, (galleries) => {
			this.setState({
				galleries: galleries,
				offset: galleries.length
			});
			this.pending = false;
		});
	}

	/**
	 * Gets new search data
	 */
	refreshData() {
		this.getAssignments(0, true);
		this.resetGalleries();
		this.getUsers(0, true);
		this.getStories(0, true);
		this.pushState();
	}

	pushState() {
		window.history.pushState(
			{},
			null,
			'?q=' + encodeURIComponent(this.props.query) +
			(this.state.tags.length > 0 ? '&tags=' + encodeURIComponent(this.state.tags.join(',')) : '') +
			(this.state.location ? '&lat=' + this.state.location.lat + '&lon=' + this.state.location.lng + '&r=' + (this.state.radius ? global.feetToMiles(this.state.radius) : '') : '')
		);
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.title}
					timeToggle={true}
					verifiedToggle={true}
					onVerifiedToggled={this.onVerifiedToggled}>
						<TagFilter
							onTagAdd={this.addTag}
							onTagRemove={this.removeTag}
							filterList={this.state.tags}
							key="tagFilter" />

						<LocationDropdown
							location={this.state.location}
							radius={this.state.radius}
							units="Miles"
							key="locationDropdown"
							onRadiusUpdate={this.onRadiusUpdate}
							onPlaceChange={this.onMapDataChange}
							onMapDataChange={this.onMapDataChange}
							defaultLocation={this.state.address} />
				</TopBar>

	    		<div
	    			id="search-container"
	    			className="container-fluid grid"
		    		onScroll={this.galleryScroll}>
	    			<div>
	    				<SearchGalleryList
	    					rank={this.props.user.rank}
		    				galleries={this.state.galleries}
		    				tags={this.state.tags}
		    				purchases={this.props.purchases.concat(this.state.purchases)}
		    				didPurchase={this.didPurchase}
		    				onlyVerified={this.state.verifiedToggle}  />

		    			<SearchSidebar
		    				assignments={this.state.assignments}
		    				stories={this.state.stories}
		    				users={this.state.users} />
	    			</div>
		    	</div>
			</App>
		);
	}
}

ReactDOM.render(
 	<Search
 		title={"Results for \"" + window.__initialProps__.title + "\""}
 		user={window.__initialProps__.user}
 		purchases={window.__initialProps__.purchases || []}
 		query={window.__initialProps__.query} />,
 	document.getElementById('app')
);
