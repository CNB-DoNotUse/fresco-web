import React from 'react'
import utils from 'utils'
import api from 'app/lib/api';
import RelatedPostImage from './related-image'

/**
 * PostRelatedTags parent object
 * @description Contains a set of related posts, determined by having shared tags
 */
export default class PostRelatedTags extends React.Component {
	state = {
		tags: {},
		selectedTag : this.props.tags ? this.props.tags[0] : null
	}

	componentDidMount() {
		this.getTags();
	}

	/**
	 * Retrieves tags for the post
	 */
	getTags = () => {
		for (let tag of this.props.tags) {
			api.get('/search', {
				limit: 5,
				posts: {
					tags: [tag]
				}				
			})
			.then(res => {	
				this.setState({
					tags: Object.assign({ [tag]: res.posts.results}, this.state.tags)
				});
			})
			.catch(() => {})
		}
	}

	setDisplayedTag = (selectedTag) => {
		if (this.state.selectedTag !== selectedTag) {
			this.setState({ selectedTag });
		}
	}

	render() {
		let tagTabs = [];
		let tagTabControls = [];

		console.log(this.state.selectedTag);

		for (let tag in this.state.tags) {
			const posts = this.state.tags[tag];
			if(!posts.length) continue;

			const toggled = tag === this.state.selectedTag ? 'toggled' : '';

			tagTabs.push(
				<div 
					className={`tab ${toggled}`} 
					key={tag}
				>
					<div className="tab-inner">
						<a className="btn btn-flat" href={`/search?q=&tags[]=${tag}`}>See all</a>
							
						{this.state.tags[tag].map((post, i) => {
							return <RelatedPostImage post={post} key={i}/>
						})}
					</div>
				</div>
			);

			tagTabControls.push(
				<button
					className={`btn btn-flat ${toggled}`}
					key={tag}
					onClick={() => { this.setDisplayedTag(tag) }}
					data-tag={tag}>{`#${tag.toUpperCase()}`}
				</button>
			);
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
