import React, { PropTypes } from 'react';
import FrescoImage from './fresco-image';
import PurchaseAction from './../actions/purchase-action.js';
import DownloadAction from './../actions/download-action.js';
import PostEditAction from './../actions/post-edit-action.js';
import global from '../../../lib/global';

/**
    * Single Post Cell, child of PostList
*/

class PostCell extends React.Component {

    constructor(props) {
        super(props);
        this.postClicked = this.postClicked.bind(this);
    }

    postClicked(e) {
        // Check if clicked with shift key
        if (e.shiftKey) {
            this.props.togglePost(this.props.post);
        } else if (e.metaKey || e.ctrlKey) {
            window.open('/post/' + this.props.post.id);
        } else {
            window.open('/post/' + this.props.post.id, '_self');
        }
    }

    render() {
        const {
            post,
            toggled,
            sort,
            assignment,
            purchased,
            didPurchase,
            rank,
            editable,
            edit,
            parentCaption,
            size,
            sizes,
        } = this.props;

        let time = sort == 'captured_at' ? post.captured_at : post.created_at;
		let	timeString = typeof(time) == 'undefined' ? 'No timestamp' : global.formatTime(time);
		let address = post.location ? post.address ? post.address : 'No Address' : 'No Address';
		let divSize = size == 'large' ? sizes.large : sizes.small;

		let statusClass = 'mdi icon pull-right '; //Class name for post tile icon
			statusClass += post.video == null 	? 'mdi-image ' : 'mdi-movie ';
			statusClass += this.props.purchased ? 'available ' : 'md-type-black-disabled ';

		return(
			<div className={`${divSize} tile ${toggled ? 'toggled' : ''}`} >
				<div className="tile-body">
					<div className="frame"></div>

					<div className="hover"  onClick={this.postClicked}>
						<p className="md-type-body1">{parentCaption}</p>

						<span className="md-type-caption">{post.byline}</span>

						<PostCellStories stories={post.stories} />
					</div>

					<FrescoImage
						image={post.image}
                        size={size}
                    />
				</div>

				<div className="tile-foot">
					<PostCellActions
						post={post}
						assignment={assignment}
						purchased={purchased}
						didPurchase={didPurchase}
						rank={rank}
						editable={editable}
                        edit={edit}
                    />

					<div>
						<div className="tile-info">
						  	<span className="md-type-body2">{address}</span>

							<span className="md-type-caption timestring" data-timestamp={time}>{timeString}</span>
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
	},
	togglePost: () => {},
	toggled: false,
};


// <span className="mdi mdi-library-plus icon pull-right"></span>
// <span className="mdi mdi-download icon toggle-edit toggler pull-right" onClick={this.downloadGallery} ></span>

/**
 * Gallery Cell Stories List
 */

class PostCellStories extends React.Component {

	render() {

		if(this.props.stories.length) {

			var stories = this.props.stories.map((stories, i) => {
		      	return (
			        <li key={i}>
			        	<a href={"/story/" + story.id}>{story.title}</a>
			        </li>
			    )
	  		});

		} else {
            return <div />;
		}

		return (
			<ul className="md-type-body2">{stories}</ul>
		);
	}

}

PostCellStories.defaultProps = {
	stories: []
}

/**
 * Post Cell Actions
 * Description : Set of icons on the the post cell's hover
 */

class PostCellActions extends React.Component {
    render() {
        const {
            rank,
            purchased,
            editable,
            post,
            edit,
            assignment,
            didPurchase,
        } = this.props;

        var actions = [],
        key = 0;

        //Check if we're CM or greater
		if(typeof(rank) !== 'undefined' && rank >= global.RANKS.CONTENT_MANAGER) {

            if(editable) {
                actions.push(
                    <PostEditAction
                        post={post}
                        edit={edit}
                        key={++key} />
                );
            }

            //Show the purhcased icon if the post hasn't been purchased
            if(purchased === false){
				actions.push(
					<PurchaseAction
						post={post}
						assignment={assignment ? assignment.id : null}
						didPurchase={didPurchase}
						key={++key}/>
				);
			}

			actions.push(
				<DownloadAction
					post={post}
					key={++key} />
			);
		}
		//Check if the post has been purchased
		else if (purchased === true)
			actions.push(
				<DownloadAction
					post={post}
					key={++key} />
			);

		//Check if the post is not purhcased, and it is purchasble from the license
		else if (purchased == false && post.license == 1) {

			actions.push(
				<PurchaseAction
					post={post}
					assignment={assignment ? assignment.id : null}
					didPurchase={didPurchase}
					key={++key} />
			);

		}

		var link = '/post/' + post.id;

		if(assignment) {
			link += '?assignment=' + assignment.id
		}

		return (
			<div className="hover">
				<a className="md-type-body2 post-link" href={link}>See more</a>
				{actions}
			</div>
		);

	}
}

PostCell.propTypes = {
    rank: PropTypes.number,
    parentCaption: PropTypes.string.isRequired,
};

export default PostCell;

