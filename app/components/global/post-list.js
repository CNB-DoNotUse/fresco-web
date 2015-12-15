import React from 'react'
import PostCell from './post-cell'
import GalleryEditBulk from '../editing/gallery-edit-bulk'

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
			selectedPosts: []
		}
		this.togglePost = this.togglePost.bind(this);
		this.setSelectedPosts = this.setSelectedPosts.bind(this);
		this.scroll = this.scroll.bind(this);
		this.didPurchase = this.didPurchase.bind(this);
	}

	componentDidMount() {

		//Check if list is initialzied with posts or the `loadPosts` prop is not defined, then don't load anything
		if(this.state.posts.length || !this.props.loadPosts) 
			return;

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

	//Scroll listener for main window
	scroll() {

		var grid = this.refs.grid;

		//Check that nothing is loading and that we're at the end of the scroll, 
		//and that we have a parent bind to load  more posts
		if(!this.state.loading && grid.scrollTop === (grid.scrollHeight - grid.offsetHeight) && this.props.loadPosts){

			//Set that we're loading
			this.setState({ loading : true });

			//Run load on parent call
			this.props.loadPosts(this.state.offset, (posts) =>{

				//Disables scroll, and returns nil if posts are nill
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

	render() {

		var purchases = this.state.purchases,
			rank = this.props.rank;

		console.log('Selected: ', this.state.selectedPosts);

		//Map all the posts into cells
		var posts = this.state.posts.map((post, i)  => {

			var purchased = purchases ? purchases.indexOf(post._id) != -1 : null,
				toggled = this.state.selectedPosts.filter((cPost) => cPost._id === post._id).length > 0 ? true : false;

			console.log(toggled);

	      	return (
	        	
	        	<PostCell 
	        		size={this.props.size} 
	        		post={post} 
	        		rank={rank} 
	        		purchased={purchased}
	        		toggled={toggled}
	        		togglePost={this.togglePost}
	        		didPurchase={this.didPurchase}
	        		key={i}
	        		editable={this.props.editable} />
	        		
	      	)

  		});

		return (

			<div>
				<div className="container-fluid fat grid" ref='grid' onScroll={this.state.scrollable ? this.scroll : null} >
					<div className="row tiles" id="posts">{posts}</div>
				</div>
				<GalleryEditBulk 
					posts={this.state.selectedPosts}
					setSelectedPosts={this.setSelectedPosts} />
			</div>

		)		
	}

}

PostList.defaultProps = {
	size : 'small',
	editable: true,
	purchases: [],
	posts: [],
	scrollable: false
}