import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import TopBar from './../components/topbar'
import SearchGalleryList from './../components/search/search-gallery-list'
import SearchSidebar from './../components/search/search-sidebar'

export class Search extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			offset: 0,
			assignments: [],
			galleries: [],
			users: [],
			stories: [],
			purchases: [],
			pending: false,
			showOnlyVerified: false,
			isResultsEnd: false
		}

		this.getAssignments = this.getAssignments.bind(this);
		this.getGalleries = this.getGalleries.bind(this);
		this.getUsers = this.getUsers.bind(this);
		this.getStories = this.getStories.bind(this);

		this.didPurchase = this.didPurchase.bind(this);
		this.galleryScroll = this.galleryScroll.bind(this);

		this.onVerifiedToggled = this.onVerifiedToggled.bind(this);
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

	// Query API for assignments
	getAssignments(offset) {
		$.get('/scripts/assignment/search', {
			q: this.props.query,
			offset: offset,
			limit: 10
		}, (assignments) => {

			if(assignments.err || !assignments.data) return;

			this.setState({
				assignments: this.state.assignments.concat(assignments.data),
			})
		})
	}

	// Query API for galleries
	getGalleries(offset, cb) {
		if( typeof cb == 'undefined') cb = function() {};

		$.get('/scripts/gallery/search', {
			q: this.props.query,
			offset: offset,
			limit: 12
		}, (galleries) => {

			if(galleries.err || !galleries.data) return;
			var newGalleries = this.state.galleries.concat(galleries.data);

			this.setState({
				galleries: newGalleries,
				offset: newGalleries.length
			});

		});
	}

	// Query API for users
	getUsers(offset) {
		$.get('/scripts/user/search', {
			q: this.props.query,
			offset: offset,
			limit: 10
		}, (users) => {

			if(users.err || !users.data.length) return;

			this.setState({
				users: this.state.users.concat(users.data)
			});
		});
	}

	// Query API for stories
	getStories(offset) {
		$.get('/scripts/story/search', {
			q: this.props.query,
			offset: offset,
			limit: 10
		}, (stories) => {

			if(stories.err || !stories.data.length) return;
			
			this.setState({
				stories: this.state.stories.concat(stories.data)
			});
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

	render() {
		return (
			<App user={this.props.user}>
				<TopBar
					title={this.props.title}
					timeToggle={true}
					verifiedToggle={true}
					onVerifiedToggled={this.onVerifiedToggled} />
	    		<div
	    			id="search-container"
	    			className="container-fluid grid"
		    		onScroll={this.galleryScroll}>
	    			<div className="row">
	    				<SearchGalleryList
	    					rank={this.props.user.rank}
		    				galleries={this.state.galleries}
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
