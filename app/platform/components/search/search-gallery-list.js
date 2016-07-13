import React from 'react'
import PostCell from './../global/post-cell.js'

export default class SearchGalleryList extends React.Component {
	
	render() {
		var purchases = this.props.purchases,
			posts = [];

		
		for (var i = 0; i < this.props.galleries.length; i++) {
			var post = this.props.galleries[i]; //Actually posts, not galleries #nolan


			if(this.props.onlyVerified && post.approvals == 0){
				continue;
			}

			posts.push(
	        	<PostCell 
	        		size="large" 
	        		post={post} 
	        		rank={this.props.rank} 
	        		purchased={purchases.indexOf(post.id) != -1}
	        		didPurchase={this.props.didPurchase}
	        		key={i} />
    		);
		};

		return (
			<div
				className="col-md-8 tiles"
				id="searchGalleryList"
				ref="searchGalleryList">
				{posts}
			</div>
		)
	}
}

SearchGalleryList.defaultProps = {
	galleries: [],
	tags: []
}