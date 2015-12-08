import React from 'react'
import PostCell from './../global/post-cell.js'

export default class SearchGalleryList extends React.Component {
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