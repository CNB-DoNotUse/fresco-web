var React = require('react');
	ReactDOM = require('react-dom'),
	SuggestionList = require('./suggestion-list.js');
	PostCell = require('./post-cell.js');

/** //

Description : List for a set of posts used across the site (/videos, /photos, /gallery/id, /assignment/id , etc.)

// **/

/**
 * Post List Parent Object 
 */

var PostList = React.createClass({

	displayName : 'Post List',

	getInitialState: function(){
		return {
			offset: 0,
			posts: [],
			loading: false,
		}
	},

	getDefaultProps: function(){
		return {
			size : 'small',
			editable: true
		}
	},

	componentDidMount: function(){

		//Check if list is initialzied with posts or the `loadPosts` prop is not defined
		if(this.props.posts || !this.props.loadPosts) return;

		var self = this;

		//Access parent var load method
		this.props.loadPosts(0, function(posts){
			
			var offset = posts ? posts.length : 0;

			//Set posts from successful response
			self.setState({
				posts: posts,
				offset : offset
			});

		});
	},

	//Scroll listener for main window
	scroll: function(){

		var grid = this.refs.grid;

		//Check that nothing is loading and that we're at the end of the scroll, 
		//and that we have a parent bind to load  more posts
		if(!this.state.loading && grid.scrollTop === (grid.scrollHeight - grid.offsetHeight) && this.props.loadPosts){

			self = this;

			//Set that we're loading
			this.setState({ loading : true });

			//Run load on parent call
			this.props.loadPosts(this.state.offset, function(posts){

				if(!posts) return;

				console.log(self.state);

				var offset = self.state.posts.length + posts.length;

				//Set galleries from successful response, and unset loading
				self.setState({
					posts: self.state.posts.concat(posts),
					offset : offset,
					loading : false
				});

			});
		}
	},
	render : function(){

		//Check if list was initialzied with posts
		if(this.props.posts != null)
			posts = this.props.posts;
		//Otherwise use the state posts
		else
			posts = this.state.posts;

		var purchases = this.props.purchases,
			rank = this.props.rank;

		//Map all the posts into cells
		var posts = posts.map(function (post, i) {

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

  		}, this);

		return (

			<div className="container-fluid fat grid" ref='grid' onScroll={this.props.scrollable ? this.scroll : null}>
				<div className="row tiles" id="posts">{posts}</div>
			</div>

		)		
	}

});

module.exports = PostList;