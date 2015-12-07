import React from 'react'
import ReactDOM from 'react-dom'
import TopBar from './../components/topbar.js'
import App from './app.js'
import PostCell from './../components/post-cell.js'

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
		    			<SearchSide
		    				assignments={this.state.assignments}
		    				stories={this.state.stories}
		    				users={this.state.users} />
	    			</div>
		    	</div>
			</App>
		);
	}
}

class SearchGalleryList extends React.Component {
	render() {
		var galleries = [];
		var purchases = this.props.purchases;

		for (var g in this.props.galleries) {
			if(this.props.showOnlyVerified && !this.props.galleries[g].approvals) continue;
			galleries.push(
	        	<PostCell 
	        		size="large" 
	        		post={this.props.galleries[g]} 
	        		rank={this.props.rank} 
	        		purchased={purchases.indexOf(this.props.galleries[g]._id) != -1}
	        		didPurchase={this.props.didPurchase}
	        		key={g}
	        		editable="true" />
    		);
		}

		return (
			<div
				className="col-md-8 tiles"
				id="searchGalleryList"
				ref="searchGalleryList">
				{galleries}
			</div>
		)
	}
}

class SearchSide extends React.Component {
	render() {

		var assignments = [],
			stories = [],
			users = [];
		
		// Build assignment list item
		this.props.assignments.map((assignment, i) => {
			assignments.push(
				<li key={i}><a href={"/assignment/" + assignment._id}>{assignment.title}</a></li>
			);
		});

		// Build story list item
		this.props.stories.map((story, i) => {
			stories.push(
				<li key={i}><a href={"/story/" + story._id}>{story.title}</a></li>
			);
		});

		// Build user list item
		this.props.users.map((user, i) => {
			users.push(
				<li className="meta-user" key={i}>
					<div>
						<a href="/user/5643aec78a5565ec64df0d71">
							<img
								className="img-circle img-responsive"
								src={user.avatar || 'https://d1dw1p6sgigznj.cloudfront.net/images/user-1-small.png'} />
						</a>
					</div>
					<div>
						<a href="/user/5643aec78a5565ec64df0d71">
							<span className="md-type-title">{user.firstname} {user.lastname}</span>
						</a>
						<span className="md-type-body1">{user.twitter ? '' : 'No Twitter'} • {user.outlet ? <a href={"/outlet/" + user.outlet}>Outlet</a> : 'No Outlet'}</span>
					</div>
				</li>
			);
		});

		return (
			<div className="col-md-4">
				<h3 className="md-type-button md-type-black-secondary">Assignments</h3>
				<ul id="assignments" className="md-type-subhead">{assignments}</ul>
				<h3 className="md-type-button md-type-black-secondary">Stories</h3>
				<ul id="stories" className="md-type-subhead">{stories}</ul>
				<h3 className="md-type-button md-type-black-secondary">Users</h3>
				<ul id="users" className="meta">{users}</ul>
			</div>
		)
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
