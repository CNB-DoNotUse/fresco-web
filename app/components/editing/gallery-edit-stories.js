import _ from 'lodash'
import React from 'react'
import Tag from './tag'
import StoriesAutoComplete from './stories-autocomplete.js'

/**
 * Component for managing added/removed stories
 */

export default class GalleryEditStories extends React.Component {

	constructor(props)  {
		
		super(props);
		this.addStory = this.addStory.bind(this);
		this.removeStory = this.removeStory.bind(this);
	}

	//Adds story element, return if story exists in prop stories.
	addStory(newStory) {
		var stories = _.clone(this.props.stories, true);

		for( var s in stories ) {
			if(stories[s]._id == newStory._id) {
				return;
			}
		}

		stories.push(newStory);
		this.props.updateRelatedStories(stories);

	}

	//Removes story
	removeStory(storyId) {
		var stories = _.clone(this.props.stories, true);
		var ids = stories.map(s => s._id);
		var index = ids.indexOf(storyId);
		if(index == -1) return;

		stories.splice(index, 1);

		this.props.updateRelatedStories(stories);

	}

	render() {
		/*onClick={this.props.removeStory.bind(null, story.title) */ 
		var stories = _.clone(this.props.stories, true);
			stories = stories.map((story, i) => {
			return (
				<Tag 
					text={story.title} 
					plus={false}
					onClick={this.removeStory.bind(null, story._id)}
					key={i} />
			)
		});

		return (

			<div className="dialog-row split chips">
				
				<div className="split-cell">
					<StoriesAutoComplete addStory={this.addStory} />
					<ul id="gallery-stories-list" className="chips">
						{stories}
					</ul>
				</div>
				
				<div className="split-cell">
					<span className="md-type-body2">Suggested stories</span>
					<ul id="gallery-suggested-stories-list" className="chips"></ul>
				</div>

			</div>

		);
	}
}