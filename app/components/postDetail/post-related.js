import React from 'react'
import global from '../../../lib/global'
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
			tags: {},
			selectedTag : this.props.gallery.tags ? this.props.gallery.tags[0] : null
		};

		this.getTags = this.getTags.bind(this);
		this.setDisplayedTag = this.setDisplayedTag.bind(this);
	}

	componentDidMount() {
		this.getTags();
	}

	getTags() {
		for (let tag of this.props.gallery.tags) {
			$.get('/api/gallery/search', {
				limit: 10,
				tags: tag
			}, (posts) => {
				if(posts.err || !posts.data) {
					return console.log('Error getting posts for tag: ' + tag);
				}

				this.state.tags[tag] = posts.data;
				this.setState(this.state);
			});
		}
	}

	setDisplayedTag(event) {
		if (this.state.selectedTag === event.currentTarget.dataset.tag) {
			return;
		}
		this.setState({
			selectedTag: event.currentTarget.dataset.tag
		});
	}

	render() {
		let tagTabs = [];
		let tagTabControls = [];
		for (let tag of this.props.gallery.tags) {
			if (!this.state.tags[tag]) {
				break;
			}
			let posts = this.state.tags[tag].map((post, i) => {
				return (
					<a href={"/post/" + post._id} key={i}>
						<img
							className="img-link"
							src={global.formatImg(post.image, 'small')}
							key={i} />
					</a>
				);
			});

			let toggled = tag === this.state.selectedTag ? 'toggled' : '';

			let tab =
				<div className={"tab " + toggled} key={tag}>
					<div className="tab-inner">
						<a className="btn btn-flat" href={"/search?tags=" + tag}>See all</a>
						{posts}
					</div>
				</div>;

			let tabControl = <button className={"btn btn-flat " + toggled} key={tag} onClick={this.setDisplayedTag} data-tag={tag}>#{tag.toUpperCase()}</button>

			tagTabs.push(tab);
			tagTabControls.push(tabControl);
		}

		return (
			<div className="row related hidden-xs">
				<div className="tab-control">
					{tagTabControls}
				</div>
				<div className="tabs">
					{tagTabs}
				</div>
			</div>
		);

	// 	if (this.props.gallery.posts && this.props.gallery.posts.length > 1){
	//
	// 		var posts = this.props.gallery.posts.map((post, i) => {
	//
	// 			return (
	// 				<a href={"/post/" + post._id} key={i}>
	// 					<img
	// 						className="img-link"
	// 						src={global.formatImg(post.image, 'small')}
	// 						key={i} />
	// 				</a>
	// 			);
	//
	// 		})
	//
	// 		return (
	// 			<div className="row related hidden-xs">
	// 				<div className="tab-control">
	// 					<button className="btn btn-flat toggled">More from this gallery</button>
	// 				</div>
	// 				<div className="tabs">
	// 					<div className="tab toggled">
	// 						<div className="tab-inner">
	// 							<a className="btn btn-flat" href={"/gallery/" + this.props.gallery._id}>See all</a>
	// 							{posts}
	// 						</div>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		);
	//
	// 	}
	// 	else
	// 		return null;
	//
	}

}
