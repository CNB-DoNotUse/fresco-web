import React from 'react'
import SuggestionList from './suggestion-list.js'
import PostCell from './post-cell.js'

/** //

Description : List for a set of posts used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

// **/

/**
 * Post List Parent Object 
 */

export default class PostList extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			offset: 0,
			posts: [],
			loading: false,
		}
	}

	componentDidMount() {

		//Check if list is initialzied with posts or the `loadPosts` prop is not defined
		if(this.props.posts || !this.props.loadPosts) return;

		//Access parent var load method
		this.props.loadPosts(0, (posts) => {
			
			var offset = posts ? posts.length : 0;

			//Set posts from successful response
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

				if(!posts) return;

				var offset = self.state.posts.length + posts.length;

				//Set galleries from successful response, and unset loading
				this.setState({
					posts: this.state.posts.concat(posts),
					offset : offset,
					loading : false
				});

			});
		}
	}

	render() {

		//Check if list was initialzied with posts
		if(this.props.posts != null)
			posts = this.props.posts;
		//Otherwise use the state posts
		else
			posts = this.state.posts;

		var purchases = this.props.purchases,
			rank = this.props.rank;

		//Map all the posts into cells
		var posts = posts.map((post, i)  => {

			var purchased = purchases ? purchases.indexOf(post._id) != -1 : null;

	      	return (
	        	
	        	<PostCell 
	        		size={this.props.size} 
	        		post={post} 
	        		rank={rank} 
	        		purchaed={purchased}
	        		key={i}
	        		editable={this.props.editable} />
	        		
	      	)

  		});

		return (

			<div className="container-fluid fat grid" ref='grid' onScroll={this.props.scrollable ? this.scroll : null}>
				<div className="row tiles" id="posts">{posts}</div>
			</div>

		)		
	}

}

PostList.defaultProps = {
	size : 'small',
	editable: true
}