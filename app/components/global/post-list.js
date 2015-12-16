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
			gallery: this.props.gallery,
			galleryToggled: false
		}
		this.togglePost 		= this.togglePost.bind(this);
		this.setSelectedPosts 	= this.setSelectedPosts.bind(this);
		this.scroll 			= this.scroll.bind(this);
		this.didPurchase 		= this.didPurchase.bind(this);
		this.edit 				= this.edit.bind(this);
		this.hideGallery 		= this.hideGallery.bind(this);
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
	/**
	 * Called when PostCellAction's Edit button is clicked
	 * @param  {Object} post - Has post
	 */
	edit(post) {
		$.get(global.API_URL + '/v1/gallery/get', {id: post.parent}, (data) => {
			if(data.err) return;
			this.setState({
				gallery: data.data,
				galleryToggled: true
			});
		});
	}

	hideGallery() {
		this.setState({
			galleryToggled: false
		});
	}

	render() {

		var purchases = this.state.purchases,
			rank = this.props.rank;

		//Map all the posts into cells
		var posts = this.state.posts.map((post, i)  => {

			var purchased = purchases ? purchases.indexOf(post._id) != -1 : null,
				toggled = this.state.selectedPosts.filter((cPost) => cPost._id === post._id).length > 0 ? true : false;

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
	        		editable={this.props.editable}
	        		edit={this.edit} />
	        		
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
				<GalleryEdit 
					gallery={this.state.gallery}
					toggled={this.state.galleryToggled}
					hide={this.hideGallery} />
				<GalleryCreate posts={this.state.selectedPosts} />
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
	scrollable: false
}