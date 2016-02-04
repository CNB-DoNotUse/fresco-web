import _ from 'lodash'
import React from 'react'
import PostCell from './post-cell'
import GalleryEdit from '../editing/gallery-edit'
import GalleryEditBulk from '../editing/gallery-edit-bulk'
import global from '../../../lib/global'
import GalleryCreate from '../editing/gallery-create'

/** //

Description : List for a set of posts used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

// **/

/**
 * Post List Parent Object 
 */

export default class PostList extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			offset: 0,
			purchases: this.props.purchases,
			posts: this.props.posts,
			loading: false,
			scrollable: this.props.scrollable,
			selectedPosts: [],
			gallery: null,
			galleryEditToggled: false
		}

		this.togglePost 		= this.togglePost.bind(this);
		this.setSelectedPosts 	= this.setSelectedPosts.bind(this);
		this.scroll 			= this.scroll.bind(this);
		this.didPurchase 		= this.didPurchase.bind(this);
		this.edit 				= this.edit.bind(this);
		this.toggle				= this.toggle.bind(this);
		this.loadInitialPosts	= this.loadInitialPosts.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		//If we receive new posts in props while having none previously
		var currentPostIds  = this.state.posts.map(p => p._id),
			newPostIds 		= nextProps.posts.map(p => p._id),
			diffIds 		= _.difference(newPostIds, currentPostIds);

		//Check diff or if the parent tells the component to update
	    if(nextProps.posts.length != this.props.posts.length || diffIds.length || nextProps.updatePosts) {
	    	this.setState({
	    		posts: nextProps.posts
	    	});
	    }
	}

	componentDidUpdate(prevProps, prevState) {
		//Checks if the verified prop is changed
		//`or` Checks if the sort prop is changed
		if(prevProps.onlyVerified != this.props.onlyVerified 
			|| prevProps.sort != this.props.sort ) {
			this.loadInitialPosts();
		}
	}

	componentDidMount() {
		//Check if list is initialzied with posts, then don't load anything
		if(this.state.posts.length) 
			return;

		this.loadInitialPosts();
	}
	
	/**
	 * Initial call to populate posts
	 */
	loadInitialPosts() {
		//Access parent var load method
		this.props.loadPosts(0, (posts) => {
			//Update offset based on psts from callaback
			var offset = posts ? posts.length : 0;

			//Set posts & callback from successful response
			this.setState({
				posts: posts,
				offset : offset
			});
		});
	}


	/**
	 * Scroll listener for main window
	 */
	scroll(e) {

		var grid = e.target;

		//Check that nothing is loading and that we're at the end of the scroll, 
		//and that we have a parent bind to load  more posts
		if(!this.state.loading && grid.scrollTop > ((grid.scrollHeight - grid.offsetHeight ) - 400) && this.props.loadPosts){

			//Set that we're loading
			this.setState({ loading : true });

			//This is here for the new post-list structure, so we check to send an id or an offset integer
			var offset = this.props.idOffset ? this.state.posts[this.state.offset - 1]._id : this.state.offset;

			//Run load on parent call
			this.props.loadPosts(offset, (posts) => {

				//Disables scroll, and returns if posts are empty
				if(!posts || posts.length == 0){ 
					
					this.setState({
						scrollable: false
					});

					return;

				}

				var offset = this.state.posts.length + posts.length;

				//Set galleries from successful response, and unset loading
				this.setState({
					posts: this.state.posts.concat(posts),
					offset : offset,
					loading : false
				});

			}, this);
		}
	}

	/**
	 * Sets the `selectedPosts` state property
	 * @param {array} posts The posts to set the `selectedPosts` to
	 */
	setSelectedPosts(posts){
		this.setState({
			selectedPosts: posts
		});
	}

	/**
	 * Toggles posts in stateful selected posts
	 * @param  {object} passedPost The post to toggle selected or unselected in the post-list and bulk edit
	 */
	togglePost(passedPost) {

		//Check if CM
		if(this.props.rank < global.RANKS.CONTENT_MANAGER) return;

		//Filter out anything, but ones that equal the passed post
		var result = this.state.selectedPosts.filter((post) => {
			return passedPost._id === post._id
		});

		//Post not found, so add
		if(result.length == 0){

			this.setState({
				selectedPosts: this.state.selectedPosts.concat(passedPost)
			});

		}
		//No post found
		else{

			this.setState({
				selectedPosts: this.state.selectedPosts.filter((post) => post._id !== passedPost._id)
			});

		}
	}

	/**
	 * Called when an item is purchased.
	 * Adds purchase ID to current purchases in state.
	 * Prop chain: PostList -> PostCell -> PostCellActions -> PostCellAction -> PurchaseAction
	 */
	didPurchase(id) {
		this.setState({
			purchases: this.state.purchases.concat(id)
		});
	}

	/**
	 * Called when PostCellAction's Edit button is clicked
	 * @param  {Object} post - Has post
	 */
	edit(gallery) {
		this.setState({
			gallery: gallery,
			galleryEditToggled: true
		});
	}

	/**
	 * Called when GalleryEdit should be toggled
	 */
	 toggle() {
	 	if(this.state.galleryEditToggled) {
	 		this.setState({
	 			gallery: null,
	 			galleryEditToggled: false
	 		});
	 	}
	 }

	render() {
		var purchases = this.state.purchases,
			rank = this.props.rank,
			posts = [];

		for (var i = 0; i < this.state.posts.length; i++) {
			
			var post = this.state.posts[i];

			if(this.props.onlyVerified && post.approvals == 0){
				continue;
			}

			var purchased = purchases.indexOf(post._id) > -1 || this.props.allPurchased ? true : false,
				//Filter out this posts from the currently selected posts
				filteredPosts = this.state.selectedPosts.filter((currentPost) => currentPost._id === post._id),
				//Pass down toggled if this post is inside the filtered posts
				toggled = filteredPosts.length > 0 ? true : false;

	      	posts.push(
	        	<PostCell 
	        		size={this.props.size} 
	        		post={post} 
	        		rank={rank} 
	        		purchased={purchased}
	        		toggled={toggled}
	        		key={i}
	        		editable={this.props.editable}
	        		
	        		togglePost={this.togglePost}
	        		didPurchase={this.didPurchase}
	        		edit={this.edit} />	
	      	);
		}

		return (
			<div>
				<div className="container-fluid fat grid" ref='grid' onScroll={this.state.scrollable ? this.scroll : null} >
					<div className="row tiles" id="posts">{posts}</div>
				</div>
				
				<GalleryEditBulk 
					posts={this.state.selectedPosts}
					setSelectedPosts={this.setSelectedPosts} />
				
				<GalleryEdit 
					gallery={this.state.gallery}
					toggled={this.state.galleryEditToggled}
					toggle={this.toggle} />
				
				<GalleryCreate 
					setSelectedPosts={this.setSelectedPosts}
					posts={this.state.selectedPosts} />
			</div>
		)		
	}

}

PostList.defaultProps = {
	size : 'small',
	editable: true,
	purchases: [],
	posts: [],
	gallery: null,
	scrollable: false,
	onlyVerified: false,
	loadPosts: function() {}
}