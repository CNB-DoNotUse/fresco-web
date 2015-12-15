import React from 'react'
import ReactDOM from 'react-dom'
import global from '../../lib/global'
import App from './app'
import TopBar from './../components/topbar'
import SearchGalleryList from './../components/search/search-gallery-list'
import SearchSidebar from './../components/search/search-sidebar'

export class Search extends React.Component {

	constructor(props) {
		super(props);
			
		var queryLat = this.getParameterByName('lat');
		var queryLng = this.getParameterByName('lon');
		var queryRadius = this.getParameterByName('r');
		var location = null;
		var polygon = null;

		if(queryLat && queryLng) {
			location = {
				lat: parseFloat(queryLat),
				lng: parseFloat(queryLng)
			}
		}

		if(queryRadius) {
			var radius = parseFloat(queryRadius);
			if(radius == 'NaN') { queryRadius = null; return; }

			queryRadius = global.milesToMeters(radius);

			if(location) {
				var circle = new google.maps.Circle({
					map: null,
					center: location,
					radius: queryRadius
				})
				polygon = this.circleToPolygon(circle, 8);
			}

		}

		this.state = {
			offset: 0,
			assignments: [],
			galleries: [],
			users: [],
			stories: [],
			purchases: [],
			tags: [],
			pending: false,
			showOnlyVerified: false,
			isResultsEnd: false,
			location: location,
			radius: queryRadius,
			polygon: polygon
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

		this.refreshData			= this.refreshData.bind(this);
	}

	componentDidMount() {
		this.getAssignments(0);
		this.getGalleries(0, () => {
			this.setState({
				pending: false
			});
		});
		this.getStories(0);
		this.getUsers(0);
	}

	componentDidUpdate(prevProps, prevState) {
		if(JSON.stringify(prevState.location) != JSON.stringify(this.state.location) || 
			JSON.stringify(prevState.radius) != JSON.stringify(this.state.radius)) {
			this.refreshData()
		}
	}

	circleToPolygon(circle, numSides){
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
		$.get('/scripts/assignment/search', {
			q: this.props.query,
			offset: offset,
			limit: 10,
			verified: this.state.showOnlyVerified,
			tags: this.state.tags,
			lat: this.state.location ? this.state.location.lat : undefined,
			lon: this.state.location ? this.state.location.lng : undefined,
			radius: this.state.radius ? (this.state.radius / 5280) : undefined
		}, (assignments) => {

			if(assignments.err || !assignments.data) return;

			this.setState({
				assignments: force ? assignments.data : this.state.assignments.concat(assignments.data),
			});
		})
	}

	// Query API for galleries
	getGalleries(offset, force) {

		var polygon = null;

		if(this.state.map) {
			if(this.state.circle) {
				polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(this.state.circle, 8)));
			}
		}

		if(this.state.location && this.state.radius) {
			var circle = new google.maps.Circle({
				map: null,
				center: this.state.location,
				radius: this.state.radius
			});

			polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(circle, 8)))
		}

		$.get('/scripts/gallery/search', {
			q: this.props.query,
			offset: offset,
			limit: 12,
			polygon: polygon,
		}, (galleries) => {

			if(galleries.err || !galleries.data) return;
			var newGalleries = this.state.galleries.concat(galleries.data);

			this.setState({
				galleries: force ? galleries.data : newGalleries,
				offset: force ? galleries.data.length : newGalleries.length
			});

		});
	}

	// Query API for users
	getUsers(offset, force) {
		$.get('/scripts/user/search', {
			q: this.props.query,
			offset: offset,
			limit: 10
		}, (users) => {

			if(users.err || !users.data.length) return;

			this.setState({
				users: force ? users.data : this.state.users.concat(users.data)
			});
		});
	}

	// Query API for stories
	getStories(offset, force) {

		var polygon = null;

		if(this.state.map) {
			if(this.state.circle) {
				polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(this.state.circle, 8)));
			}
		}

		if(this.state.location && this.state.radius) {
			var circle = new google.maps.Circle({
				map: null,
				center: this.state.location,
				radius: this.state.radius
			});
			
			polygon = encodeURIComponent(JSON.stringify(this.circleToPolygon(circle, 8)))
		}

		$.get('/scripts/story/search', {
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
		if(this.state.tags.indexOf(tag) == -1) return; 

		var tags = [], tagList = this.state.tags;
		for (var t in tagList) {
			if(tagList[t] == tag) continue;
			tags.push(tagList[t]);
		}

		this.setState({
			tags: tags
		});
	}

	/** 
		Called when an item is purchased.
		Adds purchase ID to current purchases in state.
		Prop chain: PostList -> PostCell -> PostCellActions -> PostCellAction -> PurchaseAction
	**/
	didPurchase(id) {
		var purchases = [];
		this.state.purchases.map((purchase) => { purchases.push(purchase); })
		purchases.push(id);
		this.setState({
			purchases: purchases
		});
	}

	// Called when gallery div scrolls
	galleryScroll(e) {

		// Get scroll offset and get more purchases if necessary.
		var searchContainer = document.getElementById('search-container');
		var pxToBottom = searchContainer.scrollHeight - (searchContainer.clientHeight + searchContainer.scrollTop);
		var shouldGetMoreResults = pxToBottom <= 96;
		// Check if already getting purchases because async
		if(shouldGetMoreResults && !this.state.pending) {
			// Pass current offset to getMorePurchases
			this.getGalleries(this.state.offset, () => {
				// Allow getting more results after we've gotten more results.
				// Update offset to new results length
				this.setState({
					pending: false,
					offset: this.state.galleries.length
				});
			});
		}
	}

	// Called when topbar verifiedToggle changed
	onVerifiedToggled(toggled) {
		this.setState({
			showOnlyVerified: toggled
		});
	}

	onMapDataChange(data) {
		this.setState({
			location: data.location,
			radius: data.radiusX,
			map: {
				circle: data.circle
			}
		});
	}
	
	refreshData() {

		this.getAssignments(0, true);
		this.getGalleries(0, true);
		this.getUsers(0, true);
		this.getStories(0, true);

		window.history.pushState(
			{},
			null,
			'?q=' + encodeURIComponent(this.props.query) +
			(this.state.tags.length > 0 ? '&tags=' + encodeURIComponent(this.state.tags.join(',')) : '') +
			(this.state.location ? '&lat=' + this.state.location.lat + '&lon=' + this.state.location.lng + '&r=' + (this.state.radius ? global.feetToMeters(this.state.radius) : '') : '')
		);
	}

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.title}
					timeToggle={true}
					verifiedToggle={true}
					tagFilter={true}
					tagList={this.state.tags}
					onTagAdd={this.addTag}
					onTagRemove={this.removeTag}
					locationDropdown={true}
					onMapDataChange={this.onMapDataChange}
					onVerifiedToggled={this.onVerifiedToggled} />
	    		<div
	    			id="search-container"
	    			className="container-fluid grid"
		    		onScroll={this.galleryScroll}>
	    			<div className="row">
	    				<SearchGalleryList
	    					rank={this.props.user.rank}
		    				galleries={this.state.galleries}
		    				tags={this.state.tags}
		    				purchases={this.props.purchases.concat(this.state.purchases)} 
		    				didPurchase={this.didPurchase}
		    				showOnlyVerified={this.state.showOnlyVerified} />
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
 		purchases={window.__initialProps__.purchases}
 		query={window.__initialProps__.query} />,
 	document.getElementById('app')
);
