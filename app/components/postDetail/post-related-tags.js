import React from 'react'
import global from '../../../lib/global'
import RelatedPostImage from './post-related-image'
/** //

Description : Related posts at the bottom of the PostDetail view, organized by tags

// **/

/**
 * PostRelatedTags parent object
 * @description Contains a set of related posts, determined by having shared tags
 */

export default class PostRelatedTags extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			tags: {},
			selectedTag : this.props.tags ? this.props.tags[0] : null
		};

		this.getTags = this.getTags.bind(this);
		this.setDisplayedTag = this.setDisplayedTag.bind(this);
	}

	componentDidMount() {
		this.getTags();
	}

	getTags() {
		for (let tag of this.props.tags) {
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
		if (this.props.tags.length === 0) {
			return null;
		}

		let tagTabs = [];
		let tagTabControls = [];
		for (let tag of this.props.tags) {
			if (!this.state.tags[tag]) {
				break;
			}
			let posts = this.state.tags[tag].map((post, i) => {
				return <RelatedPostImage post={post} key={i}/>
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
	}
}
