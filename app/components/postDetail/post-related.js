import React from 'react'
import global from '../../../lib/global'
import RelatedPostImage from './post-related-image'
/** //

Description : Related posts at the bottom of the PostDetail view

// **/

/**
 * PostRelated parent object
 * @description Contains set of all other posts in the parent gallery
 */

export default class PostRelated extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			stories: {},
			selectedTab: 'gallery'
		}

		if (this.props.gallery.posts.length > 0) {
			this.state.stories.gallery = this.props.gallery.posts;
		}

		this.getStories = this.getStories.bind(this);
		this.setDisplayedTab = this.setDisplayedTab.bind(this);
	}

	componentDidMount() {
		this.getStories();
	}

	getStories() {
		for (let story of this.props.gallery.related_stories) {
			$.get('/api/story/posts', {
				id: story._id,
				limit: 10
	 		}, (posts) => {
				if (posts.err || !posts.data) {
					return console.log('Error getting posts for story ' + story);
				}

				this.state.stories[story._id] = posts.data;
				this.setState(this.state);
			});
		}
	}

	setDisplayedTab(event) {
		if (this.state.selectedTab === event.currentTarget.dataset.tab) {
			return;
		}
		this.setState({
			selectedTab: event.currentTarget.dataset.tab
		});
	}

	render() {
		let tabs = [];
		let tabControls = [];

		if (this.state.stories.gallery) {
			let posts = this.state.stories.gallery.map((post, i) => {
				return <RelatedPostImage post={post} key={i}/>
			});

			let toggled = this.state.selectedTab === 'gallery' ? 'toggled' : '';

			tabs.push(
				<div className={"tab " + toggled} key="gallery">
					<div className="tab-inner">
						<a className="btn btn-flat" href={"/gallery/" + this.props.gallery._id}>See all</a>
						{posts}
					</div>
				</div>
			);

			tabControls.push(<button className={"btn btn-flat " + toggled} key="gallery" onClick={this.setDisplayedTab} data-tab="gallery">More from this gallery</button>);
		}

		for (let story of this.props.gallery.related_stories) {
			if (!this.state.stories[story._id]) {
				break;
			}

			let posts = this.state.stories[story._id].map((post, i) => {
				return <RelatedPostImage post={post} key={i}/>
			});

			let toggled = this.state.selectedTab === story._id ? 'toggled' : '';

			tabs.push(
				<div className={"tab " + toggled} key={story._id}>
					<div className="tab-inner">
						<a className="btn btn-flat" href={"/story/" + story._id}>See all</a>
						{posts}
					</div>
				</div>
			);

			tabControls.push(<button className={"btn btn-flat " + toggled} key={story._id} onClick={this.setDisplayedTab} data-tab={story._id}>{story.title.toUpperCase()}</button>);
		}

		return (
			<div className="row related hidden-xs">
				<div className="tab-control">
					{tabControls}
				</div>
				<div className="tabs">
					{tabs}
				</div>
			</div>
		);

		// if (this.props.gallery.posts && this.props.gallery.posts.length > 1){
		//
		// 	var posts = this.props.gallery.posts.map((post, i) => {
		// 		return <RelatedPostImage post={post} key={i}/>
		// 	})
		//
		// 	return (
		// 		<div className="row related hidden-xs">
		// 			<div className="tab-control">
		// 				<button className="btn btn-flat toggled">More from this gallery</button>
		// 			</div>
		// 			<div className="tabs">
		// 				<div className="tab toggled">
		// 					<div className="tab-inner">
		// 						<a className="btn btn-flat" href={"/gallery/" + this.props.gallery._id}>See all</a>
		// 						{posts}
		// 					</div>
		// 				</div>
		// 			</div>
		// 		</div>
		// 	);
		//
		// }
		// else
		// 	return null;

	}

}
