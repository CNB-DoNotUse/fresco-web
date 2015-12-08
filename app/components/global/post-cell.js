import React from 'react'
import PurchaseAction from './../actions/purchase-action.js';
import DownloadAction from './../actions/download-action.js';
import global from './../../../lib/global'

/**
 * Single Post Cell, child of PostList
 */

export default class PostCell extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {

		var timestamp = this.props.post.time_created;
		var timeString = global.formatTime(this.props.post.time_created);
		var address = this.props.post.location.address || 'No Address';
		var size = this.props.sizes.large;

		//Class name for post tile icon
		var statusClass = 'mdi icon pull-right ';
		statusClass += this.props.post.video == null ? 'mdi-file-image-box ' : 'mdi-movie ';
		statusClass += this.props.purchased ? 'available ' : 'md-type-black-disabled ';

		if(this.props.size == 'small')
			size = this.props.sizes.small;

		return(

			<div className={size + ' tile'}>
				<div className="tile-body">
					<div className="frame"></div>
						<div className="hover">
							<p className="md-type-body1">{this.props.post.caption}</p>
							<span className="md-type-caption">{this.props.post.byline}</span>
							<PostCellStories stories={this.props.post.stories} />
						</div>
					<div className="img">
						<img className="img-cover" src={global.formatImg(this.props.post.image, 'small')} />
					</div>
				</div>
				<div className="tile-foot">
					<PostCellActions
						post={this.props.post}
						purchased={this.props.purchased}
						didPurchase={this.props.didPurchase}
						rank={this.props.rank}
						editable={this.props.editable} />
					<div>
						<div className="tile-info">
						  	<span className="md-type-body2">{address}</span>
							<span className="md-type-caption timestring" data-timestamp={this.props.post.time_created}>{timeString}</span>
						</div>
						<span className={statusClass}></span>
					</div>
				</div>
			</div>

		)
	}

};

PostCell.defaultProps = {
	sizes: {
		large: 'col-xs-12 col-sm-6 col-lg-4',
		small: 'col-xs-6 col-sm-4 col-md-3 col-lg-2'
	}
}

// <span className="mdi mdi-library-plus icon pull-right"></span>
// <span className="mdi mdi-download icon toggle-edit toggler pull-right" onClick={this.downloadGallery} ></span>

/**
 * Gallery Cell Stories List
 */

class PostCellStories extends React.Component {

	render() {

		var stories = ''

		if(this.props.stories){

			var stories = this.props.stories.map((stories, i) => {
		      	return (

			        <li key={i}>
			        	<a href={"/story/" + story._id}>{story.title}</a>
			        </li>

			    )
	  		});

		}

		return (
			<ul className="md-type-body2">{stories}</ul>
		);
	}

}

/**
 * Post Cell Actions
 * Description : Set of icons on the the post cell's hover
 */

class PostCellActions extends React.Component {

	render() {

		var actions = [],
			key = 0;

		//Check if we're CM or greater
		if(typeof(this.props.rank) !== 'undefined' && this.props.rank >= 1) {

			if(this.props.editable)
				actions.push(
					<span className="mdi mdi-pencil icon pull-right toggle-gedit toggler" onClick={this.edit} key={++key}></span>
				);

			actions.push(
				<DownloadAction post={this.props.post} key={++key} />
			);

			//Show the purhcased icon if the post hasn't been purchased                       
			if(this.props.purchased === false){

				actions.push(
					<PurchaseAction post={this.props.post} didPurchase={this.props.didPurchase} key={++key}/>
				);

			}
		}
		//Check if the post has been purchased
		else if (this.props.purhcased === true)
			actions.push(
				<span className="mdi mdi-download icon pull-right" onClick={this.download} key={++key}></span>
			);

		//Check if the post is not purhcased, and it is purchasble from the license
		else if (this.props.purchased == false && this.props.post.license == 1) {

			actions.push(
				<span class="mdi mdi-library-plus icon pull-right" key={++key}></span>
			);
			actions.push(
				<PurchaseAction post={this.props.post} didPurchase={this.props.didPurchase} key={++key} />
			);

		}

		return (
			<div className="hover">
				<a className="md-type-body2 post-link" href={'/post/'+ this.props.post._id}>See more</a>
				{actions}
			</div>
		);

	}

}